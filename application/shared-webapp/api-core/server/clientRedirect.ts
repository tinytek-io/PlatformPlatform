export function clientRedirect(url: string, statusCode: number): Response {
  return new Response(null, {
    status: statusCode,
    headers: {
      "Client-Location": url
    }
  });
}
