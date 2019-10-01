import django.dispatch

radiam_user_created = django.dispatch.Signal(
    providing_args=['user'],
)

radiam_project_created = django.dispatch.Signal(
    providing_args=['project', 'request'],
)

radiam_project_deleted = django.dispatch.Signal(
    providing_args=['project', 'request'],
)

