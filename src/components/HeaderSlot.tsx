import { getCurrentUser } from "@/lib/auth";
import Header from "@/components/Header";

export default async function HeaderSlot() {
  const user = await getCurrentUser().catch(() => null);
  const headerUser = user
    ? {
        memberId: user.memberId,
        firstName: user.firstName,
        stageName: user.stageName,
        silhouette: user.silhouette,
        hasBody: user.hasBody,
        hasPortrait: user.hasPortrait,
        photoVersion: user.photoVersion,
        bodyPhotoType: user.bodyPhotoType,
      }
    : null;

  return <Header user={headerUser} />;
}
