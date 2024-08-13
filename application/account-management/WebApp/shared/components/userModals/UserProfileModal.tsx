import { Modal } from "@repo/ui/components/Modal";
import { MailIcon } from "lucide-react";
import { Input } from "@repo/ui/components/Input";
import { useAuthentication, useUserInfo } from "@repo/infrastructure/auth/hooks";
import { TextField } from "@repo/ui/components/TextField";
import { FieldGroup } from "@repo/ui/components/Field";
import { Label } from "@repo/ui/components/Label";
import { useFormState } from "react-dom";
import { serverAction } from "@/shared/lib/api/elysia";
import { AvatarImageField } from "@repo/ui/components/AvatarImageField";
import { FormDialog } from "@repo/ui/components/FormDialog";

type ProfileModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function UserProfileModal({ isOpen, onOpenChange }: Readonly<ProfileModalProps>) {
  const { reloadUserInfo } = useAuthentication();
  const userInfo = useUserInfo();

  const [{ success, title, message, errors, data }, action, isPending] = useFormState(
    serverAction("/account-management/api/users/:userId"),
    { success: null }
  );
  if (!userInfo) return null;

  if (success) {
    console.log("User updated successfully");
    reloadUserInfo();
    onOpenChange(false);
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable>
      <FormDialog
        title="Edit profile"
        description="Manage your profile here"
        actionLabel="Save changes"
        action={action}
        validationErrors={errors}
        onOpenChange={onOpenChange}
      >
        <input type="hidden" name="userId" value={userInfo.id} />
        <AvatarImageField
          name="image"
          label="Photo"
          placeholder="Upload an image"
          avatarUrl={userInfo.avatarUrl}
          initials={userInfo.initials}
          acceptedFileTypes={["image/png"]}
        />
        <div className="flex flex-row gap-4">
          <TextField
            name="firstName"
            label="First name"
            placeholder="E.g. Olivia"
            defaultValue={userInfo.firstName ?? ""}
          />
          <TextField name="lastName" label="Last name" placeholder="E.g. Rhye" defaultValue={userInfo.lastName ?? ""} />
        </div>
        <TextField>
          <Label>Email</Label>
          <FieldGroup>
            <MailIcon className="w-4 h-4" />
            <Input value={userInfo.email} isDisabled isEmbedded />
          </FieldGroup>
        </TextField>
        <TextField
          name="title"
          label="Title"
          placeholder="E.g. Marketing Manager"
          defaultValue={userInfo.title ?? ""}
        />
      </FormDialog>
    </Modal>
  );
}

export default UserProfileModal;
