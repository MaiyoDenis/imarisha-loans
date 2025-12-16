from app.models import (
    Achievement, UserAchievement, User, Loan, SavingsAccount, Member,
    Badge, UserBadge, UserPoints, Challenge, UserChallenge, Reward, UserReward,
    Leaderboard, Transaction
)
from app import db, cache
from sqlalchemy import func, desc, and_
from datetime import datetime, timedelta
import json

class GamificationService:
    TIER_THRESHOLDS = {
        'bronze': 0,
        'silver': 500,
        'gold': 1500,
        'platinum': 3500,
        'diamond': 7000
    }

    POINTS_PER_ACTION = {
        'loan_disbursement': 50,
        'loan_repayment': 100,
        'savings_deposit': 25,
        'challenge_completion': 200,
        'achievement_unlocked': 150,
        'badge_earned': 100,
        'group_activity': 30,
        'perfect_attendance': 75
    }

    @staticmethod
    def award_points(user_id, action_type, amount=None):
        """Award points to a user for specific actions"""
        try:
            points = amount if amount else GamificationService.POINTS_PER_ACTION.get(action_type, 0)
            if points == 0:
                return False

            user_points = UserPoints.query.filter_by(user_id=user_id).first()
            if not user_points:
                user_points = UserPoints(user_id=user_id)
                db.session.add(user_points)

            user_points.total_points += points
            user_points.lifetime_points += points
            user_points.points_tier = GamificationService._calculate_tier(user_points.lifetime_points)
            user_points.last_updated = datetime.utcnow()

            db.session.commit()
            GamificationService._invalidate_user_cache(user_id)
            return True
        except Exception as e:
            db.session.rollback()
            return False

    @staticmethod
    def deduct_points(user_id, amount):
        """Deduct points from user (for reward redemption)"""
        try:
            user_points = UserPoints.query.filter_by(user_id=user_id).first()
            if not user_points or user_points.total_points < amount:
                return False

            user_points.total_points -= amount
            user_points.points_tier = GamificationService._calculate_tier(user_points.lifetime_points)
            user_points.last_updated = datetime.utcnow()

            db.session.commit()
            GamificationService._invalidate_user_cache(user_id)
            return True
        except:
            db.session.rollback()
            return False

    @staticmethod
    def _calculate_tier(lifetime_points):
        """Calculate user tier based on lifetime points"""
        for tier in ['diamond', 'platinum', 'gold', 'silver', 'bronze']:
            if lifetime_points >= GamificationService.TIER_THRESHOLDS[tier]:
                return tier
        return 'bronze'

    @staticmethod
    def award_badge(user_id, badge_name):
        """Award a badge to a user"""
        try:
            badge = Badge.query.filter_by(name=badge_name, is_active=True).first()
            if not badge:
                return False

            existing = UserBadge.query.filter_by(user_id=user_id, badge_id=badge.id).first()
            if existing:
                return False

            user_badge = UserBadge(user_id=user_id, badge_id=badge.id)
            db.session.add(user_badge)
            GamificationService.award_points(user_id, 'badge_earned', 100)
            db.session.commit()
            GamificationService._invalidate_user_cache(user_id)
            return True
        except:
            db.session.rollback()
            return False

    @staticmethod
    def check_achievements(user_id):
        """Check and award achievements for a user"""
        try:
            user = User.query.get(user_id)
            if not user:
                return []

            new_achievements = []
            member = user.member_profile[0] if isinstance(user.member_profile, list) and user.member_profile else None

            if member:
                savings = member.savings_account
                completed_loans = Loan.query.filter_by(member_id=member.id, status='completed').count()
                loan_repayments = Transaction.query.filter(
                    Transaction.member_id == member.id,
                    Transaction.transaction_type == 'loan_repayment'
                ).count()

                achievements_to_check = [
                    ('SAVER_10K', savings.balance >= 10000 if savings else False),
                    ('SAVER_50K', savings.balance >= 50000 if savings else False),
                    ('SAVER_100K', savings.balance >= 100000 if savings else False),
                    ('FIRST_LOAN_PAID', completed_loans >= 1),
                    ('RELIABLE_BORROWER', completed_loans >= 5),
                    ('LOAN_MASTER', completed_loans >= 10),
                    ('REPAYMENT_CHAMPION', loan_repayments >= 20),
                ]

                for achievement_name, condition in achievements_to_check:
                    if condition:
                        achievement = Achievement.query.filter_by(name=achievement_name).first()
                        if achievement:
                            existing = UserAchievement.query.filter_by(
                                user_id=user_id, achievement_id=achievement.id
                            ).first()
                            if not existing:
                                ua = UserAchievement(user_id=user_id, achievement_id=achievement.id)
                                db.session.add(ua)
                                GamificationService.award_points(user_id, 'achievement_unlocked', achievement.points)
                                new_achievements.append(achievement)

                db.session.commit()

            return new_achievements
        except:
            db.session.rollback()
            return []

    @staticmethod
    def get_user_achievements(user_id):
        """Get all achievements for a user"""
        cache_key = f"user_achievements:{user_id}"
        cached = None

        if cached:
            return json.loads(cached)

        achievements = UserAchievement.query.filter_by(user_id=user_id).all()
        result = [ua.to_dict() for ua in achievements]

        if False:
            cache.set(cache_key, json.dumps(result))

        return result

    @staticmethod
    def get_user_badges(user_id):
        """Get all badges for a user"""
        badges = UserBadge.query.filter_by(user_id=user_id).all()
        return [ub.to_dict() for ub in badges]

    @staticmethod
    def get_user_points(user_id):
        """Get user points record"""
        user_points = UserPoints.query.filter_by(user_id=user_id).first()
        if not user_points:
            user_points = UserPoints(user_id=user_id)
            db.session.add(user_points)
            db.session.commit()

        return user_points.to_dict()

    @staticmethod
    def get_active_challenges():
        """Get all active challenges"""
        cache_key = "active_challenges"
        cached = None

        if cached:
            return json.loads(cached)

        challenges = Challenge.query.filter(
            Challenge.is_active == True,
            Challenge.status == 'active',
            Challenge.end_date > datetime.utcnow()
        ).all()

        result = [c.to_dict() for c in challenges]

        if False:
            cache.set(cache_key, json.dumps(result))

        return result

    @staticmethod
    def join_challenge(user_id, challenge_id):
        """User joins a challenge"""
        try:
            challenge = Challenge.query.get(challenge_id)
            if not challenge or not challenge.is_active:
                return False

            existing = UserChallenge.query.filter_by(
                user_id=user_id, challenge_id=challenge_id
            ).first()
            if existing:
                return False

            user_challenge = UserChallenge(user_id=user_id, challenge_id=challenge_id)
            db.session.add(user_challenge)
            db.session.commit()
            GamificationService._invalidate_challenge_cache()
            return True
        except:
            db.session.rollback()
            return False

    @staticmethod
    def update_challenge_progress(user_id, challenge_id, progress_amount):
        """Update user progress on a challenge"""
        try:
            user_challenge = UserChallenge.query.filter_by(
                user_id=user_id, challenge_id=challenge_id
            ).first()

            if not user_challenge:
                return False

            challenge = Challenge.query.get(challenge_id)
            user_challenge.progress = float(user_challenge.progress) + progress_amount

            if user_challenge.progress >= float(challenge.target_value):
                user_challenge.status = 'completed'
                user_challenge.completed_at = datetime.utcnow()
                GamificationService.award_points(user_id, 'challenge_completion', challenge.reward_points)

            db.session.commit()
            GamificationService._invalidate_challenge_cache()
            return True
        except:
            db.session.rollback()
            return False

    @staticmethod
    def get_user_challenges(user_id):
        """Get challenges for a user"""
        challenges = UserChallenge.query.filter_by(user_id=user_id).all()
        return [uc.to_dict() for uc in challenges]

    @staticmethod
    def get_available_rewards(user_id=None):
        """Get all available rewards, optionally filter by user eligibility"""
        rewards = Reward.query.filter_by(is_active=True).all()
        result = []

        for reward in rewards:
            reward_dict = reward.to_dict()

            if user_id:
                user_points = UserPoints.query.filter_by(user_id=user_id).first()
                if user_points:
                    reward_dict['canRedeem'] = user_points.total_points >= reward.points_required
                else:
                    reward_dict['canRedeem'] = False

            if reward.max_redemptions:
                reward_dict['availableRedemptions'] = reward.max_redemptions - reward.redeemed_count
            else:
                reward_dict['availableRedemptions'] = float('inf')

            result.append(reward_dict)

        return result

    @staticmethod
    def redeem_reward(user_id, reward_id):
        """Redeem a reward for a user"""
        try:
            reward = Reward.query.get(reward_id)
            if not reward or not reward.is_active:
                return False

            if reward.max_redemptions and reward.redeemed_count >= reward.max_redemptions:
                return False

            user_points = UserPoints.query.filter_by(user_id=user_id).first()
            if not user_points or user_points.total_points < reward.points_required:
                return False

            if not GamificationService.deduct_points(user_id, reward.points_required):
                return False

            user_reward = UserReward(
                user_id=user_id,
                reward_id=reward_id,
                status='earned'
            )
            db.session.add(user_reward)
            reward.redeemed_count += 1
            db.session.commit()

            GamificationService._invalidate_rewards_cache()
            return True
        except:
            db.session.rollback()
            return False

    @staticmethod
    def get_user_rewards(user_id):
        """Get rewards earned by a user"""
        rewards = UserReward.query.filter_by(user_id=user_id).all()
        return [ur.to_dict() for ur in rewards]

    @staticmethod
    def update_leaderboards():
        """Update leaderboard rankings (monthly and all-time)"""
        try:
            Leaderboard.query.delete()

            user_points = db.session.query(
                UserPoints.user_id,
                UserPoints.total_points
            ).filter(UserPoints.total_points > 0).order_by(desc(UserPoints.total_points)).all()

            for rank, (user_id, points) in enumerate(user_points, 1):
                monthly_lb = Leaderboard(
                    user_id=user_id,
                    rank=rank,
                    leaderboard_type='points',
                    points=points,
                    period='monthly'
                )
                db.session.add(monthly_lb)

            db.session.commit()
            GamificationService._invalidate_leaderboard_cache()
            return True
        except:
            db.session.rollback()
            return False

    @staticmethod
    def get_leaderboard(limit=20):
        """Get top users leaderboard"""
        cache_key = f"leaderboard:top:{limit}"
        cached = None

        if cached:
            return json.loads(cached)

        leaderboards = Leaderboard.query.order_by(Leaderboard.rank).limit(limit).all()
        result = [lb.to_dict() for lb in leaderboards]

        if False:
            cache.set(cache_key, json.dumps(result))

        return result

    @staticmethod
    def get_branch_leaderboard(branch_id, limit=20):
        """Get branch-specific leaderboard"""
        cache_key = f"leaderboard:branch:{branch_id}:{limit}"
        cached = None

        if cached:
            return json.loads(cached)

        leaderboards = db.session.query(Leaderboard).join(User).filter(
            User.branch_id == branch_id
        ).order_by(Leaderboard.rank).limit(limit).all()

        result = [lb.to_dict() for lb in leaderboards]

        if False:
            cache.set(cache_key, json.dumps(result))

        return result

    @staticmethod
    def get_user_rank(user_id):
        """Get user rank on leaderboard"""
        leaderboard = Leaderboard.query.filter_by(user_id=user_id).first()
        if leaderboard:
            return leaderboard.to_dict()
        return None

    @staticmethod
    def _invalidate_user_cache(user_id):
        """Invalidate user-specific caches"""
        if False:
            redis_client.delete(f"user_achievements:{user_id}")
            redis_client.delete(f"user_points:{user_id}")

    @staticmethod
    def _invalidate_challenge_cache():
        """Invalidate challenge caches"""
        if False:
            redis_client.delete("active_challenges")

    @staticmethod
    def _invalidate_rewards_cache():
        """Invalidate rewards caches"""
        if False:
            redis_client.delete("available_rewards")

    @staticmethod
    def _invalidate_leaderboard_cache():
        """Invalidate leaderboard caches"""
        if False:
            pattern = "leaderboard:*"
            for key in redis_client.scan_iter(match=pattern):
                redis_client.delete(key)

    @staticmethod
    def get_gamification_summary(user_id):
        """Get complete gamification summary for a user"""
        try:
            user_points = UserPoints.query.filter_by(user_id=user_id).first()
            achievements = GamificationService.get_user_achievements(user_id)
            badges = GamificationService.get_user_badges(user_id)
            challenges = GamificationService.get_user_challenges(user_id)
            rewards = GamificationService.get_user_rewards(user_id)
            user_rank = GamificationService.get_user_rank(user_id)

            return {
                'points': user_points.to_dict() if user_points else {'totalPoints': 0, 'lifetimePoints': 0, 'pointsTier': 'bronze'},
                'achievements': achievements,
                'badges': badges,
                'challenges': challenges,
                'rewards': rewards,
                'rank': user_rank,
                'totalAchievements': len(achievements),
                'totalBadges': len(badges),
                'activeChallenges': len([c for c in challenges if c.get('status') == 'active']),
                'completedChallenges': len([c for c in challenges if c.get('status') == 'completed']),
                'earnedRewards': len([r for r in rewards if r.get('status') == 'earned']),
                'redeemedRewards': len([r for r in rewards if r.get('status') == 'redeemed'])
            }
        except:
            return None
