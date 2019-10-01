
from collections import OrderedDict

from rest_framework import pagination

from django.core import paginator as django_paginator
from rest_framework.exceptions import NotFound
from rest_framework.response import Response

class Page(django_paginator.Page):
    """Page for Elasticsearch."""

    def __init__(self, object_list, number, paginator, facets):
        self.facets = facets
        self.count = object_list.hits.total
        super(Page, self).__init__(object_list, number, paginator)

class Paginator(django_paginator.Paginator):
    """Paginator for Elasticsearch."""

    def page(self, number):
        """Returns a Page object for the given 1-based page number.
        self.object_list is instance of ES-DSL Search object in this case.
        :param number:
        :return:
        """

        number = self.validate_number(number)
        bottom = (number - 1) * self.per_page
        top = bottom + self.per_page


        if top + self.orphans >= self.count:
            top = self.count
        object_list = self.object_list[bottom:top].execute()

        __facets = getattr(object_list, 'aggregations', None)
        return self._get_page(object_list, number, self, facets=__facets)

    def _get_page(self, *args, **kwargs):
        """Get page.
        Returns an instance of a single page.
        This hook can be used by subclasses to use an alternative to the
        standard :cls:`Page` object.
        """
        return Page(*args, **kwargs)


class PageNumberPagination(pagination.PageNumberPagination):
    """
    Page number pagination for Elasticsearch queries
    """
    django_paginator_class = Paginator
    page_size_query_param = 'page_size'
    page_query_param = 'page'

    def __init__(self, *args, **kwargs):
        """Constructor.
        :param args:
        :param kwargs:
        """
        self.facets = None
        # self.page = None
        # self.request = None
        self.count = None
        super(PageNumberPagination, self).__init__(*args, **kwargs)

    # def get_facets(self, page=None):
    #     """Get facets.
    #     :param page:
    #     :return:
    #     """
    #     if page is None:
    #         page = self.page
    #
    #     if hasattr(page, 'facets') and hasattr(page.facets, '_d_'):
    #         return page.facets._d_

    def paginate_queryset(self, queryset, request, view=None):
        """
        Paginate the queryset

        Paginate a queryset if required, either returning a page object,
        or `None` if pagination is not configured for this view.

        :param queryset:
        :param request:
        :param view:
        :return:
        """

        page_size = self.get_page_size(request)
        if not page_size:
            return None

        paginator = self.django_paginator_class(queryset, page_size)
        page_number = request.query_params.get(self.page_query_param, 1)
        if page_number in self.last_page_strings:
            page_number = paginator.num_pages

        try:
            self.page = paginator.page(page_number)
        except django_paginator.InvalidPage as exc:
            msg = "Invalid {} parameter".format(self.page_query_param)
            raise NotFound(msg)

        if paginator.num_pages > 1 and self.template is not None:
            # The browsable API should display pagination controls.
            self.display_page_controls = True

        self.request = request
        return list(self.page)

    def get_paginated_response_context(self, data):
        """Get paginated response data.
        :param data:
        :return:
        """
        __data = [
            ('count', self.page.count),
            # ('count', 'this is a count'),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
        ]
        # __facets = self.get_facets()
        # if __facets is not None:
        #     __data.append(
        #         ('facets', __facets),
        #     )
        __data.append(
            ('results', data),
        )
        return __data

    def get_paginated_response(self, data):
        """Get paginated response.
        :param data:
        :return:
        """

        return Response(OrderedDict(self.get_paginated_response_context(data)))

    # def get_count(self, response):
    #     return response.hits.total
