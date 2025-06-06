---
trigger: glob
globs: **/Integrations/**/*.cs
description: Rules for creating external integration services
---

# External Integrations

Carefully follow these instructions when implementing integrations with external services in the backend, including structure, error handling, and client conventions.

## Implementation

1. Create integration clients in the `/[scs-name]/Core/Integrations/[ServiceName]/[ServiceClient].cs` file location.
2. Create a client class with a clear purpose and name.
3. Use constructor injection with primary constructor syntax for dependencies.
4. Implement proper error handling and logging:
   - Never throw exceptions from integration clients.
   - Return appropriate types (null, optional, or Result types) instead.
   - Log errors with appropriate severity levels and structured data.
5. Use typed clients with HttpClient injection (via AddHttpClient<T>) for HTTP-based integrations.
6. Configure resilience policies:
   - Set appropriate timeouts for external calls.
   - Implement retry policies for transient errors.
   - Consider circuit breakers for failing services.
7. Support cancellation tokens for proper request cancellation.
8. Create DTOs for request and response data when needed (but don't postfix with `Dto`).
9. Keep the implementation of one client in one file. Only if the client is very complex, should it be split into multiple files.
10. Register clients in the DI container using the typed client pattern.

## Examples

### Example 1 - HTTP Client Integration

```csharp
// ✅ DO: Use typed clients with proper error handling and logging
public sealed record Gravatar(Stream Stream, string ContentType);

public sealed class GravatarClient(HttpClient httpClient, ILogger<GravatarClient> logger)
{
    public async Task<Gravatar?> GetGravatar(UserId userId, string email, CancellationToken cancellationToken)
    {
        try
        {
            var hash = Convert.ToHexString(MD5.HashData(Encoding.ASCII.GetBytes(email)));
            var gravatarUrl = $"avatar/{hash.ToLowerInvariant()}?d=404";

            var response = await httpClient.GetAsync(gravatarUrl, cancellationToken);
            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                logger.LogInformation("No Gravatar found for user {UserId}", userId);
                return null;
            }

            if (!response.IsSuccessStatusCode)
            {
                logger.LogError("Failed to fetch Gravatar for user {UserId}. Status Code: {StatusCode}", userId, response.StatusCode);
                return null;
            }

            return new Gravatar(
                await response.Content.ReadAsStreamAsync(cancellationToken),
                response.Content.Headers.ContentType?.MediaType!
            );
        }
        catch (TaskCanceledException ex)
        {
            logger.LogError(ex, "Timeout when fetching gravatar for user {UserId}", userId);
            return null;
        }
    }
}

// ❌ DON'T: Throw exceptions from integration clients
public class BadGravatarClient
{
    private readonly HttpClient _httpClient;
    
    public BadGravatarClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }
    
    public async Task<Gravatar> GetGravatar(string email)
    {
        var hash = Convert.ToHexString(MD5.HashData(Encoding.ASCII.GetBytes(email)));
        var gravatarUrl = $"avatar/{hash.ToLowerInvariant()}";
        
        // Don't do this - throws exceptions for not found or error responses
        var response = await _httpClient.GetAsync(gravatarUrl);
        response.EnsureSuccessStatusCode(); // This throws an exception!
        
        return new Gravatar(
            await response.Content.ReadAsStreamAsync(),
            response.Content.Headers.ContentType?.MediaType!
        );
    }
}
```

### Example 2 - Client Registration

```csharp
// ✅ DO: Register clients with proper configuration and resilience policies
public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddGravatarClient(this IServiceCollection services)
    {
        services.AddHttpClient<GravatarClient>(client =>
        {
            client.BaseAddress = new Uri("https://gravatar.com/");
            client.Timeout = TimeSpan.FromSeconds(5);
        })
        .AddTransientHttpErrorPolicy(policy => policy.WaitAndRetryAsync(
            new[] { TimeSpan.FromMilliseconds(500), TimeSpan.FromSeconds(1) }
        ));
        
        return services;
    }
}

// ❌ DON'T: Create clients without proper configuration
public static class BadServiceCollectionExtensions
{
    public static IServiceCollection AddBadGravatarClient(this IServiceCollection services)
    {
        // Missing timeout, base address, and resilience policies
        services.AddHttpClient<BadGravatarClient>();
        return services;
    }
}
```
