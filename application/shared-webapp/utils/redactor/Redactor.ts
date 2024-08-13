export function anonEmail(email: string): string {
    return email.replace(/(?<=.{3}).(?=[^@]*?@)/g, "*");
}
