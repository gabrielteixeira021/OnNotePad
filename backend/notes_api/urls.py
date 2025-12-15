from django.urls import path

from . import views

urlpatterns = [
    path("notes/", views.NoteListCreateView.as_view(), name="note-list"),
    path("notes/delete/", views.NoteDeleteView.as_view(), name="note-delete"),
]
