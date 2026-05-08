from django.contrib import admin
from .models import Country, State, City

@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(State)
class StateAdmin(admin.ModelAdmin):
    list_display = ('name', 'country')
    list_filter = ('country',)
    prepopulated_fields = {'slug': ('name',)}

@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ('name', 'state')
    list_filter = ('state__country', 'state')
    prepopulated_fields = {'slug': ('name',)}
