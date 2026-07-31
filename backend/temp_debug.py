# temp_debug.py
from rest_framework.test import APIRequestFactory, force_authenticate
from notes.views import MatiereViewSet, EtudiantViewSet
from django.contrib.auth import get_user_model
import traceback

User = get_user_model()
user = User.objects.get(username='diagadmin')

factory = APIRequestFactory()

try:
    req = factory.get('/api/matieres/')
    force_authenticate(req, user=user)
    view = MatiereViewSet.as_view({'get': 'list'})
    resp = view(req)
    print('response status', resp.status_code)
    try:
        print(resp.data)
    except Exception:
        print('cannot access resp.data')
except Exception:
    print('EXCEPTION during MatiereViewSet:')
    traceback.print_exc()

try:
    req2 = factory.get('/api/etudiants/')
    force_authenticate(req2, user=user)
    view2 = EtudiantViewSet.as_view({'get': 'list'})
    resp2 = view2(req2)
    print('response status etudiants', resp2.status_code)
    try:
        print(resp2.data)
    except Exception:
        print('cannot access resp2.data')
except Exception:
    print('EXCEPTION during EtudiantViewSet:')
    traceback.print_exc()
