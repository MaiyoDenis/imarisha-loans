from flask import Blueprint, jsonify, request
from app.services.gamification_service import GamificationService
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import UserAchievement, Challenge, Reward

bp = Blueprint('gamification', __name__, url_prefix='/api/gamification')

@bp.route('/achievements', methods=['GET'])
@jwt_required()
def get_my_achievements():
    current_user_id = get_jwt_identity()
    GamificationService.check_achievements(current_user_id)
    achievements = GamificationService.get_user_achievements(current_user_id)
    return jsonify(achievements)

@bp.route('/badges', methods=['GET'])
@jwt_required()
def get_my_badges():
    current_user_id = get_jwt_identity()
    badges = GamificationService.get_user_badges(current_user_id)
    return jsonify(badges)

@bp.route('/points', methods=['GET'])
@jwt_required()
def get_my_points():
    current_user_id = get_jwt_identity()
    points = GamificationService.get_user_points(current_user_id)
    return jsonify(points)

@bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    limit = request.args.get('limit', 20, type=int)
    leaderboard = GamificationService.get_leaderboard(limit)
    return jsonify(leaderboard)

@bp.route('/leaderboard/branch/<int:branch_id>', methods=['GET'])
def get_branch_leaderboard(branch_id):
    limit = request.args.get('limit', 20, type=int)
    leaderboard = GamificationService.get_branch_leaderboard(branch_id, limit)
    return jsonify(leaderboard)

@bp.route('/rank', methods=['GET'])
@jwt_required()
def get_my_rank():
    current_user_id = get_jwt_identity()
    rank = GamificationService.get_user_rank(current_user_id)
    return jsonify(rank or {})

@bp.route('/challenges', methods=['GET'])
def get_challenges():
    challenges = GamificationService.get_active_challenges()
    return jsonify(challenges)

@bp.route('/challenges/join/<int:challenge_id>', methods=['POST'])
@jwt_required()
def join_challenge(challenge_id):
    current_user_id = get_jwt_identity()
    success = GamificationService.join_challenge(current_user_id, challenge_id)
    
    if success:
        return jsonify({'message': 'Successfully joined challenge'}), 201
    return jsonify({'error': 'Failed to join challenge'}), 400

@bp.route('/challenges/<int:challenge_id>/progress', methods=['POST'])
@jwt_required()
def update_challenge_progress(challenge_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or 'progress' not in data:
        return jsonify({'error': 'Progress amount required'}), 400
    
    success = GamificationService.update_challenge_progress(
        current_user_id, challenge_id, data['progress']
    )
    
    if success:
        return jsonify({'message': 'Progress updated'}), 200
    return jsonify({'error': 'Failed to update progress'}), 400

@bp.route('/my-challenges', methods=['GET'])
@jwt_required()
def get_my_challenges():
    current_user_id = get_jwt_identity()
    challenges = GamificationService.get_user_challenges(current_user_id)
    return jsonify(challenges)

@bp.route('/rewards', methods=['GET'])
@jwt_required()
def get_rewards():
    current_user_id = get_jwt_identity()
    rewards = GamificationService.get_available_rewards(current_user_id)
    return jsonify(rewards)

@bp.route('/rewards/<int:reward_id>/redeem', methods=['POST'])
@jwt_required()
def redeem_reward(reward_id):
    current_user_id = get_jwt_identity()
    success = GamificationService.redeem_reward(current_user_id, reward_id)
    
    if success:
        return jsonify({'message': 'Reward redeemed successfully'}), 200
    return jsonify({'error': 'Failed to redeem reward'}), 400

@bp.route('/my-rewards', methods=['GET'])
@jwt_required()
def get_my_rewards():
    current_user_id = get_jwt_identity()
    rewards = GamificationService.get_user_rewards(current_user_id)
    return jsonify(rewards)

@bp.route('/summary', methods=['GET'])
@jwt_required()
def get_summary():
    current_user_id = get_jwt_identity()
    summary = GamificationService.get_gamification_summary(current_user_id)
    
    if summary:
        return jsonify(summary)
    return jsonify({'error': 'Failed to get summary'}), 500

@bp.route('/leaderboard/update', methods=['POST'])
@jwt_required()
def update_leaderboards():
    current_user_id = get_jwt_identity()
    from app.models import User
    user = User.query.get(current_user_id)
    
    if not user or user.role not in ['admin', 'branch_manager']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    success = GamificationService.update_leaderboards()
    
    if success:
        return jsonify({'message': 'Leaderboards updated'}), 200
    return jsonify({'error': 'Failed to update leaderboards'}), 500
