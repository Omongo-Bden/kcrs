from django.contrib.auth.models import User, Group

def setup_admins():
    district_group, _ = Group.objects.get_or_create(name='District Officials')
    agency_group, _ = Group.objects.get_or_create(name='Anti Corruption Agency')

    user1, created1 = User.objects.get_or_create(username='district_admin', defaults={'is_staff': True})
    if created1:
        user1.set_password('admin123')
        user1.save()
    user1.groups.add(district_group)

    user2, created2 = User.objects.get_or_create(username='agency_admin', defaults={'is_staff': True})
    if created2:
        user2.set_password('admin123')
        user2.save()
    user2.groups.add(agency_group)

    print("Admin users created successfully!")
    print("District Admin: district_admin / admin123")
    print("Agency Admin: agency_admin / admin123")

setup_admins()
