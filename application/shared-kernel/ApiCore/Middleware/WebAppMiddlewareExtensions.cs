using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace PlatformPlatform.SharedKernel.ApiCore.Middleware;

public static class WebAppMiddlewareExtensions
{
    public static IServiceCollection AddWebAppMiddleware(this IServiceCollection services)
    {
        return services.AddSingleton<WebAppMiddlewareConfiguration>(serviceProvider =>
                {
                    var jsonOptions = serviceProvider.GetRequiredService<IOptions<JsonOptions>>();
                    var environment = serviceProvider.GetRequiredService<IWebHostEnvironment>();
                    return new WebAppMiddlewareConfiguration(jsonOptions, environment.IsDevelopment());
                }
            )
            .AddTransient<WebAppMiddleware>();
    }
    
    public static IApplicationBuilder UseWebAppMiddleware(this IApplicationBuilder builder)
    {
        if (!Path.Exists(WebAppMiddlewareConfiguration.GetHtmlTemplatePath())) return builder;
        
        var webAppConfiguration = builder.ApplicationServices.GetRequiredService<WebAppMiddlewareConfiguration>();
        
        return builder
            .UseStaticFiles(new StaticFileOptions { FileProvider = new PhysicalFileProvider(webAppConfiguration.BuildRootPath) })
            .UseRequestLocalization("en-US", "da-DK")
            .UseMiddleware<WebAppMiddleware>();
    }
}
