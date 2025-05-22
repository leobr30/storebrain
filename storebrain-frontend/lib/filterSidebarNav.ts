import { ClassicNavType } from "@/config/menus";

type Permission = { action: string; subject: string };

export function filterSidebarNav(
    items: ClassicNavType[],
    permissions: Permission[]
): ClassicNavType[] {
    const hasPermission = (action: string, subject: string) =>
        permissions.some((p) => p.action === action && p.subject === subject);

    return items
        .map((item): ClassicNavType | null => {
            // Conserver les headers
            if ('isHeader' in item && item.isHeader) {
                return item;
            }

            const isAuthorized =
                !item.requiredPermission ||
                hasPermission(
                    item.requiredPermission.action,
                    item.requiredPermission.subject
                );

            if (!isAuthorized) return null;

            const filteredChild = Array.isArray(item.child)
                ? (item.child as ClassicNavType[]).filter((subItem) => {
                    if ('requiredPermission' in subItem && subItem.requiredPermission) {
                        return hasPermission(
                            subItem.requiredPermission.action,
                            subItem.requiredPermission.subject
                        );
                    }
                    return true;
                })
                : undefined;

            return {
                ...item,
                child: filteredChild,
            };
        })
        .filter((item): item is ClassicNavType => item !== null);
}
