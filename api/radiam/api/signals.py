import django.dispatch

radiam_user_created = django.dispatch.Signal(
    providing_args=['user'],
)

radiam_user_updated = django.dispatch.Signal(
    providing_args=['email', 'username', 'first_name'],
)

radiam_project_created = django.dispatch.Signal(
    providing_args=['project', 'request'],
)

radiam_project_deleted = django.dispatch.Signal(
    providing_args=['project', 'request'],
)

