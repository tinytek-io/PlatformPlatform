---
trigger: glob
globs: **/Tests/*.cs
description: Rules for writing backend API tests
---

# Writing API Tests

Carefully follow these instructions when writing tests for the backend. By default, tests should test API endpoints to verify behavior over implementation. Only in rare cases should unit tests be used.

## Implementation

1. Follow these naming conventions:
   - Test files should be named `[Feature]/[Command|Query]Tests.cs`.
   - Test classes should be named `[Command|Query]Tests` and be `sealed`.
   - Test methods should follow this pattern: `[Method]_[Condition]_[ExpectedResult]`.
2. Organize tests by feature area in directories matching the feature structure. Do _not_ create a `/features/` top-level folder.
3. For endpoint tests, inherit from `EndpointBaseTest<TContext>` for access to HTTP clients and test infrastructure.
4. Prefer creating API Tests to test behavior over implementation:
   - Use `AuthenticatedOwnerHttpClient` or `AuthenticatedMemberHttpClient` for authenticated requests.
   - Use `AnonymousHttpClient` for anonymous requests.
5. Use xUnit with `[Fact]` attribute or `[Theory]` if multiple test cases are needed.
6. Use FluentAssertions for clear assertion syntax.
7. Use Bogus (Faker) to generate random test data instead of hardcoded values for strings, names, etc.
8. Use NSubstitute for mocking external dependencies but never mock repositories.
9. Follow the Arrange-Act-Assert pattern with clear comments for each section:
   - Only use these three comment sections: `// Arrange`, `// Act`, and `// Assert`
   - Only include `// Arrange` comments in tests when there's actually an arrange section with setup code.
   - Do not add additional comments for subsections (e.g., no `// Setup database` or `// Verify telemetry events`).
10. Test both happy path and error cases.
11. Avoid sharing fields between tests as they can change for different reasons; prefer local constants or variables within each test method.
12. Verify side effects like database changes and telemetry events.
13. Always call `TelemetryEventsCollectorSpy.Reset()` as the last statement in the Arrange section, if and only if you used API calls to set up state.
14. For creating and verifying test data, use the `Connection` property from `EndpointBaseTest<TContext>`. This provides a `Microsoft.Data.Sqlite` connection with methods like:
    - `Insert` to populate test data into the database.
    - `Update` to update test data in the database.
    - `Delete` to delete test data from the database.
    - `ExecuteScalar<T>` to verify data was correctly inserted.
    - `RowExists` to check if specific records exist.
15. Never use Dapper for database operations in tests.
    - Using Dapper is the main reason for making tests that cannot be accepted.
16. The `EndpointBaseTest<TContext>` class provides:
    - Authenticated and anonymous HTTP clients for endpoint testing.
    - In-memory SQLite database for test isolation.
    - Service mocking with NSubstitute.
    - Telemetry event collection for verifying events.
    - Proper test cleanup with the Dispose pattern.

IMPORTANT: Pay special attention to ensure consistent ordering, naming, spacing, and line breaks of methods, parameters, variables, etc. For example, when creating SQL dummy data, ensure columns are in the exact same order as in the database. If you create several tests, make sure similar elements are written in the same way.

## Examples

```csharp
// ✅ DO: Use Arrange-Act-Assert, proper naming, FluentAssertions, and verify side effects
[Fact]
public async Task CompleteLogin_WhenValid_ShouldCompleteLoginAndCreateTokens()
{
    // Arrange
    var (loginId, _) = await StartLogin(DatabaseSeeder.User1.Email); // ✅ DO: Use test helpers for setup
    var command = new CompleteLoginCommand(CorrectOneTimePassword);
    TelemetryEventsCollectorSpy.Reset(); // ✅ DO: Reset telemetry if API was called in Arrange

    // Act
    var response = await AnonymousHttpClient.PostAsJsonAsync($"/api/account-management/authentication/login/{loginId}/complete", command);

    // Assert
    await response.ShouldBeSuccessfulPostRequest(hasLocation: false); // ✅ DO: Use custom assertion helpers
    Connection.ExecuteScalar("SELECT COUNT(*) FROM Logins WHERE Id = @id AND Completed = 1", new { id = loginId.ToString() }).Should().Be(1); // ✅ DO: Verify DB side effects
    TelemetryEventsCollectorSpy.CollectedEvents.Count.Should().Be(2); // ✅ DO: Verify telemetry
    TelemetryEventsCollectorSpy.CollectedEvents[0].GetType().Name.Should().Be("LoginStarted");
    TelemetryEventsCollectorSpy.CollectedEvents[1].GetType().Name.Should().Be("LoginCompleted");  // ✅ DO: Verify the correct events were collected
}

// ❌ DON'T: Mix Arrange-Act-Assert, use unclear naming, or skip side effects
[Fact]
public async Task BadTest()
{
    var response = await AuthenticatedMemberHttpClient.GetAsync("/api/account-management/users?search=willgate"); // ❌ DON'T: Unclear test name, no Arrange/Act/Assert
    Assert.Equal(HttpStatusCode.OK, response.StatusCode); // ❌ DON'T: Use basic assertions instead of FluentAssertions
    // ❌ DON'T: Skip verifying DB or telemetry side effects
}

// ✅ DO: Use SQLite helpers for test data setup, consistent column order
public GetUsersTests()
{
    Connection.Insert("Users", [
        ("TenantId", DatabaseSeeder.Tenant1.Id.ToString()),
        ("Id", UserId.NewId().ToString()),
        ("CreatedAt", TimeProvider.System.GetUtcNow().AddMinutes(-10)), // ✅ DO: Use TimeProvider for dates
        ("ModifiedAt", null),
        ("Email", Email)
    ]);
}

// ❌ DON'T: Use Dapper in tests
public class BadTestSetup
{
    public BadTestSetup() // ❌ DON'T: Add test setup logic to the constructor
    {
        // Arrange
        using var connection = new SqliteConnection(Connection.ConnectionString); // ❌ DON'T: Use Dapper
        connection.Open();

        // Insert user // ❌ DON'T: Add comment
        connection.Execute("INSERT INTO Users (Email, Id, TenantId) VALUES (@Email, @Id, @TenantId)", new { Email = "test@example.com", Id = Guid.NewGuid(), TenantId = 1 }); 
    }
}
```
