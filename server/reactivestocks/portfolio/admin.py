from django.contrib import admin
from .models import Position, Transaction, DummyPosition

admin.site.register(Position)
admin.site.register(Transaction)
admin.site.register(DummyPosition)
