from django.core.management.base import BaseCommand, CommandError
import openpyxl
from database.models import Parts17G, Parts333G, PartsSK850

class Command(BaseCommand):
    help = 'Imports data from an XLSX file into a specified Part model'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='Path to the XLSX file')
        parser.add_argument('model_name', type=str, help='Target model name (e.g., Model_333G_Parts)')

    def handle(self, *args, **kwargs):
        file_path = kwargs['file_path']
        model_name = kwargs['model_name']

        # Mapping model names to actual models
        models = {
            'Parts333G': Parts333G,
            'Parts17G': Parts17G,
            'PartsSK850': PartsSK850
        }

        target_model = models.get(model_name)

        if not target_model:
            raise CommandError('Invalid model name provided')

        try:
            workbook = openpyxl.load_workbook(file_path)
            sheet = workbook.active

            for row in sheet.iter_rows(min_row=2, values_only=True):
                part_number, part_name, description, quantity  = row
                target_model.objects.create(
                    part_number=part_number,
                    part_name=part_name,
                    description=description or 'Placeholder',
                    quantity=quantity
                )

            self.stdout.write(self.style.SUCCESS('Successfully imported data into %s from %s' % (model_name, file_path)))
        except Exception as e:
            raise CommandError('Error importing data: %s' % e)

# python manage.py import_parts "C:\RE-FLEX-3D - Copy\backend\xlsx\full_333G.xlsx" Parts333G
