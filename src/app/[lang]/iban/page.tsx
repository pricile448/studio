// This public-facing page creates a route conflict with the authenticated dashboard page at `/(dashboard)/iban`.
// It is being neutralized to resolve the build error. The correct page is the one within the (dashboard) group.
export default function DeprecatedPublicIbanPage() {
    return null;
}
