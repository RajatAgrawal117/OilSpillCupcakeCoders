from django.contrib import admin
from .models import AISData
from .models import SARData 
# Register your models here.
admin.site.register(AISData)
admin.site.register(SARData)