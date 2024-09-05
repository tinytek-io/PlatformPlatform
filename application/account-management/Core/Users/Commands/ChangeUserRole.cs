using JetBrains.Annotations;
using PlatformPlatform.AccountManagement.Core.TelemetryEvents;
using PlatformPlatform.AccountManagement.Core.Users.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.TelemetryEvents;

namespace PlatformPlatform.AccountManagement.Core.Users.Commands;

[PublicAPI]
public sealed record ChangeUserRoleCommand : ICommand, IRequest<Result>
{
    [JsonIgnore] // Removes the Id from the API contract
    public UserId Id { get; init; } = null!;

    public required UserRole UserRole { get; init; }
}

public sealed class ChangeUserRoleHandler(IUserRepository userRepository, ITelemetryEventsCollector events)
    : IRequestHandler<ChangeUserRoleCommand, Result>
{
    public async Task<Result> Handle(ChangeUserRoleCommand command, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(command.Id, cancellationToken);
        if (user is null) return Result.NotFound($"User with id '{command.Id}' not found.");

        var oldUserRole = user.Role;
        user.ChangeUserRole(command.UserRole);
        userRepository.Update(user);

        events.CollectEvent(new UserRoleChanged(oldUserRole, command.UserRole));

        return Result.Success();
    }
}
