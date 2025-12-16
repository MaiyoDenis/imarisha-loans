import os
from werkzeug.utils import secure_filename
from flask import current_app
import uuid

class FileService:
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

    @staticmethod
    def allowed_file(filename):
        return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in FileService.ALLOWED_EXTENSIONS

    @staticmethod
    def save_file(file, folder='uploads'):
        if file and FileService.allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Generate unique name
            unique_filename = f"{uuid.uuid4()}_{filename}"
            
            # Ensure static folder exists
            static_folder = os.path.join(current_app.root_path, 'static')
            os.makedirs(static_folder, exist_ok=True)
            
            upload_folder = os.path.join(static_folder, folder)
            os.makedirs(upload_folder, exist_ok=True)
            
            file_path = os.path.join(upload_folder, unique_filename)
            file.save(file_path)
            
            # Return relative URL
            return f"/static/{folder}/{unique_filename}"
        return None
