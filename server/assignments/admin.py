from django.contrib import admin

from assignments.models import Assignment, Submission

admin.site.register([Assignment, Submission])
