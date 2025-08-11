from flask import Flask,session
from application.database import db
from flask_migrate import Migrate
app = None


def create_app():
    app=Flask(__name__)
    
    app.secret_key='secret'
    app.debug=True
    app.config['SQLALCHEMY_DATABASE_URI']='sqlite:///complain.sqlite3'
    db.init_app(app)
    migrate=Migrate(app,db)

    app.app_context().push()
    return app

app=create_app()

from application.controllers import *


if __name__=='__main__':
    # db.create_all()
    # user1=User(email="admin@user.com",password="1234",name="admin",address="owner",pincode="99999",type="admin")
    # db.session.add(user1)
    # db.session.commit()
    app.run()