using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using NSubstitute;
using PlatformPlatform.AccountManagement.Database;
using PlatformPlatform.AccountManagement.Users.Commands;
using PlatformPlatform.SharedKernel.Tests;
using PlatformPlatform.SharedKernel.Tests.Persistence;
using PlatformPlatform.SharedKernel.Validation;
using Xunit;

namespace PlatformPlatform.AccountManagement.Tests.Users;

public sealed class InviteUserTests : EndpointBaseTest<AccountManagementDbContext>
{
    [Fact]
    public async Task InviteUser_WhenValid_ShouldCreateUserWithEmailConfirmedFalse()
    {
        // Arrange
        var tenantId = DatabaseSeeder.Tenant1.Id.ToString();
        var email = Faker.Internet.Email();
        var command = new InviteUserCommand(email);

        // Act
        var response = await AuthenticatedHttpClient.PostAsJsonAsync("/api/account-management/users/invite", command);

        // Assert
        await response.ShouldBeSuccessfulPostRequest(hasLocation: false);
        Connection.ExecuteScalar(
            "SELECT COUNT(*) FROM Users WHERE TenantId = @tenantId AND Email = @email AND EmailConfirmed = 0",
            new { tenantId, email = email.ToLower() }
        ).Should().Be(1);

        TelemetryEventsCollectorSpy.CollectedEvents.Count.Should().Be(2);
        TelemetryEventsCollectorSpy.CollectedEvents[0].Name.Should().Be("UserCreated");
        TelemetryEventsCollectorSpy.CollectedEvents[1].Name.Should().Be("UserInvited");
        TelemetryEventsCollectorSpy.AreAllEventsDispatched.Should().BeTrue();

        await EmailService.Received(1).SendAsync(
            email.ToLower(),
            $"You have been invited to join {tenantId} on PlatformPlatform",
            Arg.Is<string>(s => s.Contains("To gain access")),
            Arg.Any<CancellationToken>()
        );
    }

    [Fact]
    public async Task InviteUser_WhenInvalidEmail_ShouldReturnBadRequest()
    {
        // Arrange
        var invalidEmail = Faker.InvalidEmail();
        var command = new InviteUserCommand(invalidEmail);

        // Act
        var response = await AuthenticatedHttpClient.PostAsJsonAsync("/api/account-management/users/invite", command);

        // Assert
        var expectedErrors = new[]
        {
            new ErrorDetail("Email", "Email must be in a valid format and no longer than 100 characters.")
        };
        await response.ShouldHaveErrorStatusCode(HttpStatusCode.BadRequest, expectedErrors);

        TelemetryEventsCollectorSpy.AreAllEventsDispatched.Should().BeFalse();
    }

    [Fact]
    public async Task InviteUser_WhenUserExists_ShouldReturnBadRequest()
    {
        // Arrange
        var existingUserEmail = DatabaseSeeder.User1.Email;
        var command = new InviteUserCommand(existingUserEmail);

        // Act
        var response = await AuthenticatedHttpClient.PostAsJsonAsync("/api/account-management/users/invite", command);

        // Assert
        var expectedErrors = new[]
        {
            new ErrorDetail("Email", $"The email '{existingUserEmail}' is already in use by another user on this tenant.")
        };
        await response.ShouldHaveErrorStatusCode(HttpStatusCode.BadRequest, expectedErrors);

        TelemetryEventsCollectorSpy.AreAllEventsDispatched.Should().BeFalse();
    }
}