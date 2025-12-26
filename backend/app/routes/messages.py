from flask import Blueprint, request, jsonify, session
from app.models import User, Message, Role
from app import db
from app.utils.decorators import login_required
from app.services.notification_service import notification_service, NotificationChannel
from datetime import datetime
from sqlalchemy import or_, and_

bp = Blueprint('messages', __name__, url_prefix='/api/messages')

@bp.route('/contacts', methods=['GET'])
@login_required
def get_contacts():
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    role_name = user.role.name
    contacts_query = User.query.join(Role).filter(User.id != user_id)
    
    # Messaging Rules:
    # Procurement Officer: FO, BM
    # Branch Manager: anyone in branch, Admin
    # Admin: anyone
    # Field Officer: FO in same branch, BM in same branch, Admin, Procurement
    
    if role_name == 'admin':
        # Admin can see everyone
        pass
    elif role_name == 'branch_manager':
        # BM can see everyone in their branch + Admins
        contacts_query = contacts_query.filter(
            or_(
                User.branch_id == user.branch_id,
                Role.name == 'admin'
            )
        )
    elif role_name == 'procurement_officer':
        # PO can see Field Officers and Branch Managers
        contacts_query = contacts_query.filter(
            Role.name.in_(['field_officer', 'branch_manager'])
        )
    elif role_name == 'field_officer':
        # FO can see PO, Admin, and others in their branch
        contacts_query = contacts_query.filter(
            or_(
                Role.name.in_(['admin', 'procurement_officer']),
                and_(User.branch_id == user.branch_id, Role.name.in_(['field_officer', 'branch_manager']))
            )
        )
    else:
        # Default: only see Admin
        contacts_query = contacts_query.filter(Role.name == 'admin')
        
    contacts = contacts_query.all()
    return jsonify([c.to_dict() for c in contacts])

@bp.route('/send', methods=['POST'])
@login_required
def send_message():
    sender_id = session.get('user_id')
    if not sender_id:
        sender_id = request.args.get('user_id', type=int)
    data = request.get_json()
    
    recipient_id = data.get('recipientId')
    content = data.get('content')
    
    if not recipient_id or not content:
        return jsonify({'error': 'Recipient and content are required'}), 400
        
    recipient = User.query.get(recipient_id)
    if not recipient:
        return jsonify({'error': 'Recipient not found'}), 404
        
    message = Message(
        sender_id=sender_id,
        recipient_id=recipient_id,
        content=content
    )
    
    db.session.add(message)
    db.session.commit()
    
    # Notify recipient
    try:
        sender = User.query.get(sender_id)
        notification_service.send_notification(
            recipient_id=recipient_id,
            template_id="new_message",
            variables={
                "sender_name": f"{sender.first_name} {sender.last_name}"
            },
            channel=NotificationChannel.IN_APP
        )
    except Exception as e:
        print(f"Failed to send message notification: {str(e)}")
        
    return jsonify(message.to_dict()), 201

@bp.route('/conversation/<int:contact_id>', methods=['GET'])
@login_required
def get_conversation(contact_id):
    user_id = session.get('user_id')
    if not user_id:
        user_id = request.args.get('user_id', type=int)
    
    messages = Message.query.filter(
        or_(
            and_(Message.sender_id == user_id, Message.recipient_id == contact_id),
            and_(Message.sender_id == contact_id, Message.recipient_id == user_id)
        )
    ).order_by(Message.created_at.asc()).all()
    
    # Mark received messages as read
    unread_received = [m for m in messages if m.recipient_id == user_id and not m.is_read]
    if unread_received:
        for m in unread_received:
            m.is_read = True
            m.read_at = datetime.utcnow()
        db.session.commit()
        
    return jsonify([m.to_dict() for m in messages])

@bp.route('/unread-count', methods=['GET'])
@login_required
def get_unread_message_count():
    user_id = session.get('user_id')
    if not user_id:
        user_id = request.args.get('user_id', type=int)
    count = Message.query.filter_by(recipient_id=user_id, is_read=False).count()
    return jsonify({'count': count})
