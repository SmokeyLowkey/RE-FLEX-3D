"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from rest_framework.routers import DefaultRouter
from database.views import Parts333GViewSet, Parts17GViewSet, PartsSK850ViewSet, generate_presigned_url, random_part_view

router = DefaultRouter()
router.register(r'parts333g', Parts333GViewSet)
router.register(r'parts17g', Parts17GViewSet)

urlpatterns = [
    # path('api/', include(router.urls)),
    path('api/parts333g/<str:part_number>/', Parts333GViewSet.as_view({'get': 'retrieve'})),
    path('api/parts17g/<str:part_number>/', Parts17GViewSet.as_view({'get':'retrieve'})),
    path('api/partssk850/<str:part_number>/', PartsSK850ViewSet.as_view({'get':'retrieve'})),
    path('api/get-signed-url/<str:model_name>/', generate_presigned_url, name='generate-presigned-url'),
    path('admin/', admin.site.urls),
    path('tinymce/', include('tinymce.urls')),
    path('api/random-part/<str:model_name>/', random_part_view, name='random-part'),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
