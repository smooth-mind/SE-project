from django.contrib import admin

from classes.models import Class, ClassMembership

admin.site.register([Class, ClassMembership])
