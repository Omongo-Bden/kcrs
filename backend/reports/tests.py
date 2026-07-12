from django.contrib.auth.models import Group, User
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from .models import Report

class ReportModelTest(TestCase):
    def test_report_creation(self):
        report = Report.objects.create(
            report_type='BRIBERY',
            description='Test corruption in Aboke',
            location='Aboke'
        )
        self.assertEqual(report.status, 'PENDING_REVIEW')
        self.assertTrue(isinstance(report, Report))

class ReportApiTest(APITestCase):
    def setUp(self):
        self.url = reverse('report-list')
        self.group = Group.objects.create(name='District Officials')
        self.user = User.objects.create_user(username='district', password='password', email='district@example.com')
        self.user.groups.add(self.group)
        self.user.save()

    def test_create_report_anonymously(self):
        data = {
            'report_type': 'bribery',
            'description': 'Corruption activity in Aboke',
            'location': 'Aboke'
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tracking_id', response.data)
        self.assertEqual(Report.objects.count(), 1)
        report = Report.objects.first()
        self.assertEqual(report.status, 'PENDING_REVIEW')

    def test_official_can_see_reports(self):
        Report.objects.create(report_type='bribery', description='Case 1', location='Aboke')
        self.client.force_login(self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
