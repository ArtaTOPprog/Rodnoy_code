from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator


class User(AbstractUser):
    telegram = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"


    def __str__(self):
        return self.username


class Questionnaire(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='questionnaire', verbose_name='Пользователь')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    region = models.CharField(max_length=100, blank=True, verbose_name="Регион/город")
    travel_date = models.CharField(max_length=50, blank=True, verbose_name="Когда планируете")
    duration_days = models.CharField(max_length=50, blank=True, verbose_name="На сколько")
    companions = models.CharField(max_length=100, blank=True, verbose_name="С кем планируете")

    interes = models.JSONField(default=list, blank=True, verbose_name="Интересы")
    format_travel = models.JSONField(default=list, blank=True, verbose_name="Формат поездки")
    unwanted = models.JSONField(default=list, blank=True, verbose_name="Чего не хочется")

    planning_time = models.CharField(max_length=50, blank=True, verbose_name="Время планирования")
    planning_tools = models.CharField(max_length=50, blank=True, verbose_name="Инструменты планирования")
    importance_personalization = models.CharField(max_length=50, blank=True, verbose_name="Важность персонализации")

    value_proposition = models.JSONField(default=list, blank=True, verbose_name="Что ценно в сервисе")
    to_pay = models.CharField(max_length=50, blank=True, verbose_name="Готовность платить")
    ideal_route = models.TextField(blank=True, verbose_name="Идеальный маршрут")

    class Meta:
        verbose_name = "Анкета"
        verbose_name_plural = "Анкеты"
        ordering = ['-created_at']

    def __str__(self):
        return f"Анкета {self.user.username} от {self.created_at.strftime('%d,%m,%Y')}"

class Place(models.Model):
    name = models.CharField(max_length=100, blank=True, verbose_name="Название")
    description = models.TextField(verbose_name="Описание")
    category = models.CharField(max_length=50, blank=True, verbose_name="Категория")
    tags = models.JSONField(default=list, blank=True, verbose_name="Теги")
    is_popular = models.BooleanField(default=False, verbose_name="Популярное место")
    region = models.CharField(max_length=50, blank=True, db_index=True, verbose_name="Регион")
    city = models.CharField(max_length=50, blank=True, db_index=True, verbose_name="Город")
    address = models.CharField(max_length=50, blank=True, verbose_name="Адрес")
    latitude = models.FloatField(null=True, blank=True, verbose_name="Широта")
    longitude = models.FloatField(null=True, blank=True, verbose_name="Долгота")
    rating = models.FloatField(default=0.0, blank=True, verbose_name="Рейтинг")
    source = models.CharField(max_length=100, blank=True, verbose_name="Источник")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Культурный объект"
        verbose_name_plural = "Культурные объекты"
        ordering = ['name']

    def __str__(self):
        return self.name

class Generated_Route(models.Model):
    STATUS_CHOICES = (
        ('pending', 'В обработке'),
        ('ready', 'Готов'),
        ('failed', 'Ошибка'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='generated_route', verbose_name="Пользователь")
    questionnaire = models.ForeignKey(Questionnaire, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Анкета")
    title = models.CharField(max_length=200, blank=True, verbose_name="Название")
    description = models.TextField(blank=True, verbose_name="Краткое описание")
    start_date = models.DateField(null=True, blank=True, verbose_name="Дата начала")
    end_date = models.DateField(null=True, blank=True, verbose_name="Дата окончания")
    duration_days = models.IntegerField(null=True, blank=True, verbose_name="Длительность (дней)")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Статус")
    generated_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата генерации")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")
    full_text = models.TextField(blank=True, verbose_name="Полный текст маршрута")

    class Meta:
        verbose_name = "Маршрут"
        verbose_name_plural = "Маршруты"
        ordering = ['-generated_at']

    def __str__(self):
        return f"Маршрут {self.user.username} от {self.generated_at.strftime('%d, %m, %Y')}"

class Generated_Route_Place(models.Model):
    generated_route = models.ForeignKey(Generated_Route, on_delete=models.CASCADE, verbose_name="Маршрут")
    place = models.ForeignKey(Place, on_delete=models.CASCADE, verbose_name="Место")
    day_number = models.IntegerField(default=1, verbose_name="День")
    order = models.IntegerField(default=0, verbose_name="Порядок в дне")
    notes = models.TextField(blank=True, verbose_name=" Заметки")

    class Meta:
        verbose_name = "Место в маршруте"
        verbose_name_plural = "Места в маршруте"
        ordering = ['day_number', 'order']

    def __str__(self):
        return f"{self.place.name} (день {self.day_number})"


class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews', verbose_name="Пользователь")
    generated_route = models.ForeignKey(Generated_Route, on_delete=models.CASCADE, verbose_name="Машрут")
    text = models.TextField(verbose_name="Текст отзыва")
    rating = models.IntegerField(default=5, validators=[MinValueValidator(1), MaxValueValidator(5)], verbose_name="Оценка (1-5)")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Время создания")
    image = models.ImageField(upload_to='reviews/', null=True, blank=True, verbose_name="Фото")

    class Meta:
        verbose_name = "Отзыв"
        verbose_name_plural = "Отзывы"
        ordering = ['-created_at']

    def __str__(self):
        return f"Отзыв {self.user.username} от {self.created_at.strftime('%d, %m, %Y')}"