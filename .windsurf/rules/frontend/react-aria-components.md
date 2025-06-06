---
trigger: glob
globs: *.tsx
description: Rules for using React Aria Components
---

# React Aria Components

Carefully follow these instructions when using React Aria Components in the frontend, including usage, accessibility, and event handling best practices.

## Implementation

1. Use React Aria Components from `@repo/ui/components/ComponentName`:
   - Search [Components](/application/shared-webapp/ui/components) when you need to find a component.
2. Always use existing components rather than creating new ones.
3. Use `onPress` instead of `onClick` for event handlers.
4. Ensure proper accessibility attributes are applied.
5. Follow the component's documentation for proper usage patterns.

## Examples

### Example 1 - Simple Form

```tsx
import { Form } from "@repo/ui/components/Form";
import { FormErrorMessage } from "@repo/ui/components/FormErrorMessage";
import { Button } from "@repo/ui/components/Button";
import { TextField } from "@repo/ui/components/TextField";
import { Trans } from "@lingui/react/macro";

<Form>
  <TextField 
    name="email" 
    label={<Trans>Email</Trans>}
    isRequired
  />
  <FormErrorMessage error={updateUserMutation.error} />
  <Button 
    variant="primary" 
    onPress={handleSubmit}
  >
    <Trans>Submit</Trans>
  </Button>
</Form>
```
