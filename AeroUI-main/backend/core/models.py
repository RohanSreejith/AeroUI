from django.db import models

class VehicleState(models.Model):
    # Climate
    driver_temp = models.IntegerField(default=22)
    passenger_temp = models.IntegerField(default=22)
    fan_speed = models.IntegerField(default=3) # 1-5
    
    # Audio
    volume = models.IntegerField(default=50) # 0-100
    
    def save(self, *args, **kwargs):
        self.pk = 1 # Singleton
        super(VehicleState, self).save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

class MediaState(models.Model):
    title = models.CharField(max_length=100, default="Not Playing")
    artist = models.CharField(max_length=100, default="Unknown")
    album_art = models.URLField(blank=True, default="")
    is_playing = models.BooleanField(default=False)
    progress = models.IntegerField(default=0) # Seconds
    duration = models.IntegerField(default=180) # Seconds
    
    def save(self, *args, **kwargs):
        self.pk = 1 # Singleton
        super(MediaState, self).save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj
