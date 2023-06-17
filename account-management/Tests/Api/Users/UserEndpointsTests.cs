using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using NJsonSchema;
using PlatformPlatform.AccountManagement.Application.Users;
using PlatformPlatform.AccountManagement.Domain.Tenants;
using PlatformPlatform.AccountManagement.Domain.Users;
using PlatformPlatform.AccountManagement.Infrastructure;
using PlatformPlatform.SharedKernel.ApplicationCore.Validation;
using Xunit;

namespace PlatformPlatform.AccountManagement.Tests.Api.Users;

public sealed class UserEndpointsTests : BaseApiTests<AccountManagementDbContext>
{
    [Fact]
    public async Task GetUser_WhenUserExists_ShouldReturnUserWithValidContract()
    {
        // Act
        var response = await TestHttpClient.GetAsync($"/api/users/{DatabaseSeeder.User1.Id}");

        // Assert
        EnsureSuccessGetRequest(response);

        var schema = await JsonSchema.FromJsonAsync(
            """
            {
                'type': 'object',
                'properties': {
                    'id': {'type': 'long'},
                    'createdAt': {'type': 'string', 'format': 'date-time'},
                    'modifiedAt': {'type': ['null', 'string'], 'format': 'date-time'},
                    'email': {'type': 'string', 'maxLength': 100},
                    'userRole': {'type': 'integer', 'minimum': 0, maximum: 2}
                },
                'required': ['id', 'createdAt', 'modifiedAt', 'email', 'userRole'],
                'additionalProperties': false
            }
            """);

        var responseBody = await response.Content.ReadAsStringAsync();
        schema.Validate(responseBody).Should().BeEmpty();
    }

    [Fact]
    public async Task GetUser_WhenUserDoesNotExist_ShouldReturnNotFound()
    {
        // Act
        var response = await TestHttpClient.GetAsync("/api/users/999");

        // Assert
        await EnsureErrorStatusCode(response, HttpStatusCode.NotFound, "User with id '999' not found.");
    }

    [Fact]
    public async Task GetTenant_WhenTenantInvalidTenantId_ShouldReturnBadRequest()
    {
        // Act
        const string userId = "InvalidUserId";
        var response = await TestHttpClient.GetAsync($"/api/users/{userId}");

        // Assert
        await EnsureErrorStatusCode(response, HttpStatusCode.BadRequest,
            $"""Failed to bind parameter "UserId id" from "{userId}".""");
    }

    [Fact]
    public async Task CreateUser_WhenValid_ShouldCreateUser()
    {
        // Act
        var command = new CreateUser.Command(DatabaseSeeder.Tenant1.Id, "test@test.com", UserRole.TenantUser);
        var response = await TestHttpClient.PostAsJsonAsync("/api/users", command);

        // Assert
        await EnsureSuccessPostRequest(response, startsWith: "/api/users/");
        response.Headers.Location!.ToString().Length.Should().Be($"/api/users/{UserId.NewId()}".Length);
    }

    [Fact]
    public async Task CreateUser_WhenInvalidEmail_ShouldReturnBadRequest()
    {
        // Act
        var command = new CreateUser.Command(DatabaseSeeder.Tenant1.Id, "invalid email", UserRole.TenantUser);
        var response = await TestHttpClient.PostAsJsonAsync("/api/users", command);

        // Assert
        var expectedErrors = new[]
        {
            new ErrorDetail("Email", "'Email' is not a valid email address.")
        };
        await EnsureErrorStatusCode(response, HttpStatusCode.BadRequest, expectedErrors);
    }

    [Fact]
    public async Task CreateUser_WhenUserExists_ShouldReturnBadRequest()
    {
        // Act
        var user1Email = DatabaseSeeder.User1.Email;
        var command = new CreateUser.Command(DatabaseSeeder.Tenant1.Id, user1Email, UserRole.TenantUser);
        var response = await TestHttpClient.PostAsJsonAsync("/api/users", command);

        // Assert
        var expectedErrors = new[]
        {
            new ErrorDetail("Email", $"The email '{user1Email}' is already in use by another user on this tenant.")
        };
        await EnsureErrorStatusCode(response, HttpStatusCode.BadRequest, expectedErrors);
    }

    [Fact]
    public async Task CreateUser_WhenTenantDoesNotExists_ShouldReturnBadRequest()
    {
        // Act
        var command = new CreateUser.Command(new TenantId("unknown"), "test@example.com", UserRole.TenantUser);
        var response = await TestHttpClient.PostAsJsonAsync("/api/users", command);

        // Assert
        var expectedErrors = new[]
        {
            new ErrorDetail("TenantId", "The tenant 'unknown' does not exist.")
        };
        await EnsureErrorStatusCode(response, HttpStatusCode.BadRequest, expectedErrors);
    }

    [Fact]
    public async Task UpdateUser_WhenValid_ShouldUpdateUser()
    {
        // Act
        var command = new UpdateUser.Command {Email = "updated@test.com", UserRole = UserRole.TenantOwner};
        var response = await TestHttpClient.PutAsJsonAsync($"/api/users/{DatabaseSeeder.User1.Id}", command);

        // Assert
        EnsureSuccessPutRequest(response);
    }

    [Fact]
    public async Task UpdateUser_WhenInvalid_ShouldReturnBadRequest()
    {
        // Act
        var command = new UpdateUser.Command {Email = "Invalid Email", UserRole = UserRole.TenantAdmin};
        var response = await TestHttpClient.PutAsJsonAsync($"/api/users/{DatabaseSeeder.User1.Id}", command);

        // Assert
        var expectedErrors = new[]
        {
            new ErrorDetail("Email", "'Email' is not a valid email address.")
        };
        await EnsureErrorStatusCode(response, HttpStatusCode.BadRequest, expectedErrors);
    }

    [Fact]
    public async Task UpdateUser_WhenUserDoesNotExists_ShouldReturnNotFound()
    {
        // Act
        var command = new UpdateUser.Command {Email = "updated@test.com", UserRole = UserRole.TenantAdmin};
        var response = await TestHttpClient.PutAsJsonAsync("/api/users/999", command);

        //Assert
        await EnsureErrorStatusCode(response, HttpStatusCode.NotFound, "User with id '999' not found.");
    }

    [Fact]
    public async Task DeleteUser_WhenUserDoesNotExists_ShouldReturnNotFound()
    {
        // Act
        var response = await TestHttpClient.DeleteAsync("/api/users/999");

        //Assert
        await EnsureErrorStatusCode(response, HttpStatusCode.NotFound, "User with id '999' not found.");
    }

    [Fact]
    public async Task DeleteUser_WhenUserExists_ShouldDeleteUser()
    {
        // Act
        var response = await TestHttpClient.DeleteAsync($"/api/users/{DatabaseSeeder.User1.Id}");

        // Assert
        EnsureSuccessDeleteRequest(response);

        // Verify that User is deleted
        Connection.RowExists("Users", DatabaseSeeder.User1.Id.ToString()).Should().BeFalse();
    }
}