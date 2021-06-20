import os
from typing import List, Dict
from datetime import datetime, timezone, timedelta
import firebase_admin
from firebase_admin import credentials, firestore
from .enums import WagerOutcome, WagerStatus

# default to last 1 hour
def default_dt_query():
    current_dt = datetime.now(timezone.utc)
    return current_dt - timedelta(hours=1, minutes=20)

class Firebase:
    def __init__(self, env):
        try:
            self.database = firestore.client()
        except Exception:
            self.authorize(env)
            self.database = firestore.client()

    # get service credential
    def get_service_credential(self):
        col_ref = self.database.collection('service_credentials')
        docs = col_ref.where('group', '==', 'wz-callofduty').where('active', '==', True).limit(1).get()
        return docs[0].to_dict() if docs else None


    # get a list of wagers
    def get_wagers(
        self,
        outcome: str = WagerOutcome.Pending.value,
        status: str = WagerStatus.NoStatus.value,
        dt_query = default_dt_query(),
        limit: int = 10,
    ) -> List[Dict]:
        col_ref = self.database.collection('wagers')
        docs = col_ref.where('outcome', '==', outcome).where('created_at', '>=', dt_query).limit(limit).get()
        return docs
    
    def get_latest_wagers(self, user_id, limit=10):
        col_ref = self.database.collection('wagers')
        docs = col_ref.where('status', '==', 'resolved').where('user._id', '==', user_id).order_by('updated_at', 'DESCENDING').limit(limit).get()
        return docs


    def get_all_wagers(self) -> List[Dict]:
        col_ref = self.database.collection('wagers')
        docs = col_ref.get()
        return docs


    def get_all_records(self, collection) -> List[Dict]:
        col_ref = self.database.collection(collection)
        docs = col_ref.get()
        return docs


    # get a record
    def get_record(self, doc_id: str, collection: str) -> List[Dict]:
        col_ref = self.database.collection(collection).document(doc_id)
        doc = col_ref.get()
        if doc.exists:
            return doc.to_dict()
        else:
            return None


    # create a record
    def create_record(self, doc_id: str, collection: str, params: Dict) -> None:
        col_ref = self.database.collection(collection)
        if (doc_id):
            col_ref.document(doc_id).set(params)
        else:
            col_ref.add(params)


    # update a record
    def update_record(self, collection: str, doc_id: str, update_params: Dict) -> None:
        col_ref = self.database.collection(collection)
        doc_ref = col_ref.document(doc_id)
        doc_ref.set(update_params, merge=True)


    # authorize and initialize client
    def authorize(self, env) -> None:
        script_dir = os.path.dirname(__file__)
        service_account = os.path.join(script_dir, 'credentials.json')
        database_url = {'databaseURL': env('DATABASE_URL')}
        cred = credentials.Certificate(service_account)
        firebase_admin.initialize_app(cred, database_url)
