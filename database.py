import sqlalchemy as sqla
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.orm import sessionmaker
import sys

conn = sqla.create_engine('mysql+pymysql://tester:tester@localhost/project?host=localhost?port=3306')
Base = declarative_base()

class User(Base):
    __tablename__ = 'user'
    username = sqla.Column('username', sqla.VARCHAR(64), primary_key=True)
    email = sqla.Column('email', sqla.VARCHAR(64))
    firstName = sqla.Column('firstName', sqla.VARCHAR(64))
    lastName = sqla.Column('lastName', sqla.VARCHAR(64))
    password = sqla.Column('password', sqla.VARCHAR(64))
    country = sqla.Column('country', sqla.VARCHAR(64))

    preference = relationship('Category', secondary="preference_user", backref='preference')
    favorite_place = relationship('Place', secondary="favorite_place")
    favorite_event = relationship('Event', secondary="favorite_event")

class Friend(Base):
    __tablename__ = 'friend'
    username1 = sqla.Column('username1', sqla.VARCHAR(64), sqla.ForeignKey("user.username"), primary_key=True)
    username2 = sqla.Column('username2', sqla.VARCHAR(64), sqla.ForeignKey("user.username"), primary_key=True)

class Category(Base):
    __tablename__ = 'category'
    id = sqla.Column('id', sqla.Integer, primary_key=True, autoincrement=True)
    name = sqla.Column('name', sqla.VARCHAR(64))
    user = relationship('User', secondary="preference_user")

class Preference_User(Base):
    __tablename__ = 'preference_user'
    category_id = sqla.Column('category_id', sqla.Integer, sqla.ForeignKey("category.id"), primary_key=True)
    user_username = sqla.Column('user_username', sqla.VARCHAR(64), sqla.ForeignKey("user.username"), primary_key=True)

class Place(Base):
    __tablename__ = 'place'
    id = sqla.Column('id', sqla.Integer, primary_key=True, autoincrement=True)
    place_id = sqla.Column('place_id', sqla.VARCHAR(64))

class Favorite_Place(Base):
    __tablename__ = 'favorite_place'
    user_username = sqla.Column('user_username', sqla.VARCHAR(64), sqla.ForeignKey("user.username"), primary_key=True)
    place_id = sqla.Column('place_id', sqla.Integer, sqla.ForeignKey("place.id"), primary_key=True)

class Event(Base):
    __tablename__ = 'event'
    id = sqla.Column('id', sqla.Integer, primary_key=True, autoincrement=True)
    name = sqla.Column('name', sqla.VARCHAR(64))
    category = sqla.Column('category', sqla.VARCHAR(64))
    description = sqla.Column('description', sqla.VARCHAR(64))
    location = sqla.Column('location', sqla.VARCHAR(64))
    startDate = sqla.Column('startDate', sqla.DATETIME)
    endDate = sqla.Column('endDate', sqla.DATETIME)
    image = sqla.Column('image', sqla.VARCHAR(64))

class Favorite_Event(Base):
    __tablename__ = 'favorite_event'
    user_username = sqla.Column('user_username', sqla.VARCHAR(64), sqla.ForeignKey("user.username"), primary_key=True)
    event_id = sqla.Column('event_id', sqla.Integer, sqla.ForeignKey("event.id"), primary_key=True)

class Persister():
    def getPassword(self, password):
        return self.session.query(User).filter(User.password == password).first()

    def getEmail(self,email):
        return self.session.query(User).filter(User.email == email).first()

    def persist_object(self, obj):
        self.session.add(obj)
        self.session.commit()

    def remove_object(self, obj):
        self.session.delete(obj)
        self.session.commit()

    def getUser(self, name):
        return self.session.query(User).filter(User.username == name).first()

    def getCategories(self):
        return self.session.query(Category).all()

    def removePreference(self, id, name):
        preference = self.session.query(Preference_User)\
            .filter(Preference_User.user_username==name)\
            .filter(Preference_User.category_id==int(id))\
            .first()
        self.session.delete(preference)
        self.session.commit()

    def updateUserInfo(self, form):
        print(form.get('username'), file=sys.stderr)
        user = self.session.query(User)\
            .filter(User.username == form.get('username'))\
            .first()

        user.firstName = form.get('firstName')
        user.lastName = form.get('lastName')
        user.country = form.get('country')
        user.email = form.get('email')

        self.session.commit()


    def removeFavoritePlace(self, id, name):
        favorite = self.session.query(Preference_User) \
        .filter(Favorite_Place.user_username == name) \
        .filter(Favorite_Place.place_id == id) \
        .first()
        self.session.delete(favorite)
        self.session.commit()


    def removeFavoriteEvent(self, id, name):
        favorite = self.session.query(Preference_User) \
            .filter(Favorite_Event.user_username == name) \
            .filter(Favorite_Event.event_id == id) \
            .first()
        self.session.delete(favorite)
        self.session.commit()


    def __init__(self):
        Session = sessionmaker(bind=conn)
        self.session = Session()


Base.metadata.create_all(conn)