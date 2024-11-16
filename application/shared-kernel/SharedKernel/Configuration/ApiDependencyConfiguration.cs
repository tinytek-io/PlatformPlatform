using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using NJsonSchema.Generation;
using PlatformPlatform.SharedKernel.Endpoints;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Middleware;
using PlatformPlatform.SharedKernel.SinglePageApp;
using PlatformPlatform.SharedKernel.StronglyTypedIds;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.SharedKernel.Configuration;

public static class ApiDependencyConfiguration
{
    private const string LocalhostCorsPolicyName = "LocalhostCorsPolicy";

    private static readonly string LocalhostUrl = Environment.GetEnvironmentVariable(SinglePageAppConfiguration.PublicUrlKey)!;

    public static WebApplicationBuilder AddApiInfrastructure(this WebApplicationBuilder builder)
    {
        if (builder.Environment.IsDevelopment())
        {
            builder.Services.AddCors(options => options.AddPolicy(
                    LocalhostCorsPolicyName,
                    policyBuilder => { policyBuilder.WithOrigins(LocalhostUrl).AllowAnyMethod().AllowAnyHeader(); }
                )
            );
        }

        builder.WebHost.ConfigureKestrel(options => { options.AddServerHeader = false; });
        return builder;
    }

    public static WebApplicationBuilder AddDevelopmentPort(this WebApplicationBuilder builder, int port)
    {
        builder.WebHost.ConfigureKestrel((context, serverOptions) =>
            {
                if (!context.HostingEnvironment.IsDevelopment()) return;
                serverOptions.ConfigureEndpointDefaults(listenOptions => listenOptions.UseHttps());
                serverOptions.ListenLocalhost(port, listenOptions => listenOptions.UseHttps());
            }
        );
        return builder;
    }

    public static IServiceCollection AddApiServices(this IServiceCollection services, params Assembly[] assemblies)
    {
        return services
            .AddApiExecutionContext()
            .AddExceptionHandler<GlobalExceptionHandler>()
            .AddTransient<ModelBindingExceptionHandlerMiddleware>()
            .AddTransient<TelemetryContextMiddleware>()
            .AddProblemDetails()
            .AddEndpointsApiExplorer()
            .AddApiEndpoints(assemblies)
            .AddOpenApiConfiguration(assemblies)
            .AddAuthConfiguration()
            .AddHttpForwardHeaders();
    }

    private static IServiceCollection AddApiExecutionContext(this IServiceCollection services)
    {
        // Add the execution context service that will be used to make current user information available to the application
        return services.AddScoped<IExecutionContext, HttpExecutionContext>();
    }

    public static WebApplication UseApiServices(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            // Enable the developer exception page, which displays detailed information about exceptions that occur
            app.UseDeveloperExceptionPage();
            app.UseCors(LocalhostCorsPolicyName);
        }
        else
        {
            // Configure global exception handling for the production environment
            app.UseExceptionHandler(_ => { });
        }

        app
            .UseForwardedHeaders() // Enable support for proxy headers such as X-Forwarded-For and X-Forwarded-Proto. Should run before other middleware.
            .UseAuthentication()
            .UseAuthorization()
            .UseOpenApi(options => options.Path = "/openapi/v1.json") // Adds the OpenAPI generator that uses the ASP. NET Core API Explorer
            .UseMiddleware<ModelBindingExceptionHandlerMiddleware>()
            .UseMiddleware<TelemetryContextMiddleware>();

        return app.UseApiEndpoints();
    }

    private static IServiceCollection AddApiEndpoints(this IServiceCollection services, params Assembly[] assemblies)
    {
        return services
            .Scan(scan => scan
                .FromAssemblies(assemblies.Concat([Assembly.GetExecutingAssembly()]).ToArray())
                .AddClasses(classes => classes.AssignableTo<IEndpoints>())
                .AsImplementedInterfaces()
                .WithScopedLifetime()
            );
    }

    private static WebApplication UseApiEndpoints(this WebApplication app)
    {
        // Manually create all endpoint classes to call the MapEndpoints containing the mappings
        using var scope = app.Services.CreateScope();
        var endpointServices = scope.ServiceProvider.GetServices<IEndpoints>();
        foreach (var endpoint in endpointServices)
        {
            endpoint.MapEndpoints(app);
        }

        return app;
    }

    private static IServiceCollection AddOpenApiConfiguration(this IServiceCollection services, params Assembly[] assemblies)
    {
        return services.AddOpenApiDocument((settings, _) =>
            {
                settings.DocumentName = "v1";
                settings.Title = "PlatformPlatform API";
                settings.Version = "v1";

                var options = (SystemTextJsonSchemaGeneratorSettings)settings.SchemaSettings;
                options.SerializerOptions = SharedDependencyConfiguration.DefaultJsonSerializerOptions;
                settings.DocumentProcessors.Add(new StronglyTypedDocumentProcessor(assemblies.Concat([Assembly.GetExecutingAssembly()]).ToArray()));
            }
        );
    }

    private static IServiceCollection AddAuthConfiguration(this IServiceCollection services)
    {
        // Add Authentication and Authorization services
        services
            .AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
                }
            )
            .AddJwtBearer(o =>
                {
                    var tokenSigningService = SharedDependencyConfiguration.GetTokenSigningService();
                    o.TokenValidationParameters = tokenSigningService.GetTokenValidationParameters(
                        validateLifetime: true,
                        clockSkew: TimeSpan.FromSeconds(5) // In Azure, we don't need any clock skew, but this must be a higher value than the AppGateway
                    );
                }
            );

        return services.AddAuthorization();
    }

    public static IServiceCollection AddHttpForwardHeaders(this IServiceCollection services)
    {
        // Ensure correct client IP addresses are set for requests
        // This is required when running behind a reverse proxy like YARP or Azure Container Apps
        return services.Configure<ForwardedHeadersOptions>(options =>
            {
                // Enable support for proxy headers such as X-Forwarded-For and X-Forwarded-Proto
                options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
                options.KnownNetworks.Clear();
                options.KnownProxies.Clear();
            }
        );
    }
}
