from django.test import RequestFactory
from django.contrib.auth import get_user_model
from notes.views import UEViewSet
from rest_framework.test import force_authenticate
import traceback

User = get_user_model()
user = User.objects.get(username='diagadmin')
rf = RequestFactory()
req = rf.get('/api/ues/')
force_authenticate(req, user=user)
view = UEViewSet.as_view({'get':'list'})
try:
    resp = view(req)
    print('STATUS', resp.status_code)
    try:
        print(resp.data)
    except Exception as e:
        print('CANNOT READ resp.data', e)
except Exception:
    traceback.print_exc()
