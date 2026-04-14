import { useState, useEffect } from "react";
import Button from "../ui/Button";
import { UserPlus, UserCheck, UserMinus } from "lucide-react";
import * as followService from "../../services/followService";
import { toast } from "react-hot-toast";

export default function FollowButton({ userId, onStatusChange }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await followService.getFollowStatus(userId);
        setIsFollowing(data.isFollowing);
      } catch (err) {
        console.error("Failed to fetch follow status", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchStatus();
    }
  }, [userId]);

  const handleFollow = async () => {
    setActionLoading(true);
    try {
      if (isFollowing) {
        await followService.unfollowUser(userId);
        setIsFollowing(false);
        toast.success("Đã bỏ theo dõi");
      } else {
        await followService.followUser(userId);
        setIsFollowing(true);
        toast.success("Đã theo dõi");
      }
      if (onStatusChange) onStatusChange(!isFollowing);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Thao tác thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Button disabled size="sm" loading />;

  return (
    <Button
      variant={isFollowing ? "secondary" : "primary"}
      size="sm"
      loading={actionLoading}
      onClick={handleFollow}
      icon={isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
    >
      {isFollowing ? "Đang theo dõi" : "Theo dõi"}
    </Button>
  );
}
