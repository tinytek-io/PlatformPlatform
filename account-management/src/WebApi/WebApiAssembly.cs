using System.Reflection;

namespace PlatformPlatform.WebApi;

public static class WebApiAssembly
{
    public static readonly Assembly Assembly = typeof(WebApiAssembly).Assembly;

    public static readonly string Name = Assembly.GetName().Name!;
}