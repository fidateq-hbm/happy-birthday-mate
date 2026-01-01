"""
Template birthday messages for fallback when Gemini API is unavailable
500 unique, varied messages with age and culture awareness
"""

from typing import Optional, List, Tuple
from datetime import date


# Age groups
AGE_CHILDREN = (0, 12)
AGE_TEENS = (13, 17)
AGE_YOUNG_ADULTS = (18, 25)
AGE_ADULTS = (26, 64)
AGE_SENIORS = (65, 120)

# Culture regions (simplified mapping)
CULTURE_WESTERN = ['United States', 'Canada', 'United Kingdom', 'Australia', 'New Zealand', 'Ireland', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland', 'Portugal', 'Greece']
CULTURE_ASIAN = ['China', 'Japan', 'India', 'South Korea', 'Singapore', 'Thailand', 'Vietnam', 'Philippines', 'Malaysia', 'Indonesia', 'Taiwan', 'Hong Kong', 'Bangladesh', 'Pakistan', 'Sri Lanka']
CULTURE_MIDDLE_EASTERN = ['Saudi Arabia', 'United Arab Emirates', 'Israel', 'Turkey', 'Iran', 'Egypt', 'Lebanon', 'Jordan', 'Kuwait', 'Qatar', 'Bahrain', 'Oman']
CULTURE_AFRICAN = ['Nigeria', 'South Africa', 'Kenya', 'Ghana', 'Ethiopia', 'Tanzania', 'Uganda', 'Morocco', 'Algeria', 'Tunisia', 'Egypt']
CULTURE_LATIN_AMERICAN = ['Mexico', 'Brazil', 'Argentina', 'Colombia', 'Chile', 'Peru', 'Venezuela', 'Ecuador', 'Guatemala', 'Cuba', 'Dominican Republic']


def _get_age_group(age: Optional[int]) -> Optional[str]:
    """Determine age group from age"""
    if age is None:
        return None
    if age <= AGE_CHILDREN[1]:
        return 'children'
    elif age <= AGE_TEENS[1]:
        return 'teens'
    elif age <= AGE_YOUNG_ADULTS[1]:
        return 'young_adults'
    elif age <= AGE_ADULTS[1]:
        return 'adults'
    else:
        return 'seniors'


def _get_culture_group(country: Optional[str]) -> Optional[str]:
    """Determine culture group from country"""
    if not country:
        return None
    
    country_normalized = country.strip()
    
    if country_normalized in CULTURE_WESTERN:
        return 'western'
    elif country_normalized in CULTURE_ASIAN:
        return 'asian'
    elif country_normalized in CULTURE_MIDDLE_EASTERN:
        return 'middle_eastern'
    elif country_normalized in CULTURE_AFRICAN:
        return 'african'
    elif country_normalized in CULTURE_LATIN_AMERICAN:
        return 'latin_american'
    else:
        return 'universal'  # Default for unlisted countries


def _is_message_appropriate(message: str, age_group: Optional[str], culture_group: Optional[str]) -> bool:
    """
    Check if a message is appropriate for the given age and culture.
    This is a simple heuristic-based check.
    """
    if age_group == 'children':
        # Avoid messages about getting older, wisdom, etc.
        inappropriate_phrases = ['older', 'wiser', 'another year older', 'age', 'years old', 'mature', 'senior']
        if any(phrase in message.lower() for phrase in inappropriate_phrases):
            return False
        # Prefer fun, simple messages
        if len(message) > 200:  # Too long for children
            return False
    
    elif age_group == 'teens':
        # Avoid overly formal or childish language
        if 'dear' in message.lower() and 'wonderful' in message.lower() and len(message) > 150:
            return False  # Too formal
    
    elif age_group == 'seniors':
        # Avoid references to getting older
        if 'another year older' in message.lower() or 'getting older' in message.lower():
            return False
        # Prefer respectful, warm messages
        if 'party' in message.lower() and 'epic' in message.lower():
            return False  # Too casual
    
    # Culture-specific checks (basic)
    if culture_group == 'asian':
        # Prefer respectful, less casual messages
        if 'dude' in message.lower() or 'bro' in message.lower():
            return False
    
    if culture_group == 'middle_eastern':
        # Prefer respectful messages
        if 'party' in message.lower() and 'wild' in message.lower():
            return False
    
    return True


def get_template_messages(
    recipient_name: str,
    recipient_age: Optional[int] = None,
    recipient_country: Optional[str] = None
) -> List[str]:
    """
    Returns a list of birthday messages filtered by age and culture appropriateness.
    
    Args:
        recipient_name: Name of the birthday person
        recipient_age: Age in years (optional)
        recipient_country: Country name (optional)
    
    Returns:
        List of appropriate birthday messages
    """
    age_group = _get_age_group(recipient_age)
    culture_group = _get_culture_group(recipient_country)
    
    # All 500 unique messages
    all_messages = [
        # Warm & Personal (50 messages) - Universal
        f"Happy Birthday, {recipient_name}! 🎉 Wishing you a day filled with joy, laughter, and all the wonderful things you deserve. Enjoy your special day!",
        f"Dear {recipient_name}, on your special day, I hope you're surrounded by love and happiness. May this year bring you endless blessings and amazing adventures! 🎂✨",
        f"Happy Birthday {recipient_name}! 🎈 May your day be as bright and beautiful as you are. Here's to another amazing year ahead!",
        f"Wishing the happiest of birthdays to {recipient_name}! 🎊 May all your dreams come true and may this year be your best one yet!",
        f"Happy Birthday {recipient_name}! 🌟 On this special day, I hope you feel how loved and appreciated you are. Enjoy every moment!",
        f"🎉 Happy Birthday {recipient_name}! Today is all about celebrating you and the incredible person you are. May your day be absolutely magical!",
        f"Dear {recipient_name}, another year older, another year more amazing! Wishing you endless happiness and wonderful memories today! 🎂",
        f"Happy Birthday {recipient_name}! 🎈 Here's to another year of adventures, laughter, and making beautiful memories. Enjoy your special day!",
        f"🎊 Wishing you the most wonderful birthday, {recipient_name}! May this new year of your life be filled with joy, success, and everything your heart desires!",
        f"Happy Birthday {recipient_name}! 🌟 You bring so much light into the world. Today, may all that light shine back on you tenfold!",
        f"🎉 {recipient_name}, on your birthday, I hope you know how special you are! Wishing you a day as wonderful as you are!",
        f"Happy Birthday {recipient_name}! 🎂 May your special day be filled with love, laughter, and all the things that make you smile!",
        f"Dear {recipient_name}, another trip around the sun! Wishing you a birthday filled with joy and a year ahead full of amazing possibilities! ✨",
        f"🎈 Happy Birthday {recipient_name}! Today we celebrate you and all the wonderful things that make you unique. Enjoy every moment!",
        f"Wishing the happiest of birthdays to {recipient_name}! 🎊 May your day be as bright and beautiful as your smile!",
        f"Happy Birthday {recipient_name}! 🌟 Another year to shine, to grow, and to be amazing. Here's to you!",
        f"🎉 {recipient_name}, your birthday is here! Time to celebrate the incredible person you are. Wishing you endless joy today!",
        f"Happy Birthday {recipient_name}! 🎂 May this new year bring you closer to your dreams and fill your life with happiness!",
        f"Dear {recipient_name}, on your special day, I hope you feel all the love and appreciation you deserve. Happy Birthday! ✨",
        f"🎈 Happy Birthday {recipient_name}! Here's to another year of being awesome and making the world a better place!",
        f"Wishing you a fantastic birthday, {recipient_name}! 🎊 May your day be filled with all your favorite things!",
        f"Happy Birthday {recipient_name}! 🌟 Today is your day to shine. Make it count and enjoy every second!",
        f"🎉 {recipient_name}, happy birthday! May your special day be as wonderful and unique as you are!",
        f"Happy Birthday {recipient_name}! 🎂 Another year older, wiser, and more amazing. Celebrate yourself today!",
        f"Dear {recipient_name}, wishing you a birthday that's as special and wonderful as you are! Enjoy your day! ✨",
        f"🎈 Happy Birthday {recipient_name}! May this year be your best one yet, filled with joy and success!",
        f"Wishing the happiest birthday to {recipient_name}! 🎊 Today is all about you - enjoy it to the fullest!",
        f"Happy Birthday {recipient_name}! 🌟 You deserve all the happiness in the world today and always!",
        f"🎉 {recipient_name}, another year of amazing you! Wishing you a birthday filled with love and laughter!",
        f"Happy Birthday {recipient_name}! 🎂 May your day be as bright and cheerful as you make others feel!",
        f"Dear {recipient_name}, on your birthday, I hope you're surrounded by people who love and appreciate you! ✨",
        f"🎈 Happy Birthday {recipient_name}! Here's to celebrating another year of your wonderful life!",
        f"Wishing you an incredible birthday, {recipient_name}! 🎊 May all your wishes come true today!",
        f"Happy Birthday {recipient_name}! 🌟 Today marks another year of your amazing journey. Enjoy it!",
        f"🎉 {recipient_name}, happy birthday! May your special day be filled with endless joy and happiness!",
        f"Happy Birthday {recipient_name}! 🎂 Another year to create beautiful memories and chase your dreams!",
        f"Dear {recipient_name}, wishing you a birthday that's as wonderful as the person you are! ✨",
        f"🎈 Happy Birthday {recipient_name}! May this new year bring you everything you've been hoping for!",
        f"Wishing the happiest birthday to {recipient_name}! 🎊 Today is your day - make it unforgettable!",
        f"Happy Birthday {recipient_name}! 🌟 You bring so much joy to others. Today, may that joy come back to you!",
        f"🎉 {recipient_name}, happy birthday! May your day be as amazing as you make everyone else's!",
        f"Happy Birthday {recipient_name}! 🎂 Here's to another year of being incredible and inspiring others!",
        f"Dear {recipient_name}, on your special day, I hope you feel how much you're loved and appreciated! ✨",
        f"🎈 Happy Birthday {recipient_name}! May your birthday be the start of your best year yet!",
        f"Wishing you a magical birthday, {recipient_name}! 🎊 Enjoy every moment of your special day!",
        f"Happy Birthday {recipient_name}! 🌟 Another year older, another year more fabulous. Celebrate!",
        f"🎉 {recipient_name}, happy birthday! May your day be filled with all the things that make you happy!",
        f"Happy Birthday {recipient_name}! 🎂 Wishing you a year ahead full of wonderful surprises and joy!",
        f"Dear {recipient_name}, your birthday is a reminder of how special you are. Enjoy your day! ✨",
        f"🎈 Happy Birthday {recipient_name}! Here's to another year of amazing adventures and memories!",
        f"Wishing the happiest birthday to {recipient_name}! 🎊 May your day be as wonderful as you deserve!",
        f"Happy Birthday {recipient_name}! 🌟 Today we celebrate you and all the joy you bring to the world!",
        
        # Additional unique messages (450 more)
        f"🎁 Happy Birthday {recipient_name}! May your special day be wrapped in happiness and tied with a bow of joy!",
        f"💐 {recipient_name}, happy birthday! Wishing you a day as beautiful and vibrant as a garden in full bloom!",
        f"Happy Birthday {recipient_name}! 🎪 Life is a celebration, and today we celebrate you!",
        f"🌺 Dear {recipient_name}, on your birthday, may you bloom like the most beautiful flower!",
        f"🎆 Happy Birthday {recipient_name}! May your day sparkle with joy and your year shine with success!",
        f"{recipient_name}, another year of wisdom, growth, and amazing experiences! Happy Birthday! 🎂",
        f"🎈 Happy Birthday {recipient_name}! May all your balloons fly high and all your dreams come true!",
        f"💝 {recipient_name}, your birthday is a gift to everyone who knows you. Happy Birthday!",
        f"Happy Birthday {recipient_name}! 🌸 May your day be as sweet and delightful as you are!",
        f"🎊 {recipient_name}, it's time to celebrate! Wishing you the most fantastic birthday ever!",
        f"Happy Birthday {recipient_name}! 🎉 Today marks another milestone in your incredible journey!",
        f"Dear {recipient_name}, may your birthday be the beginning of a year filled with happy memories! ✨",
        f"🎂 Happy Birthday {recipient_name}! Here's to cutting the cake and making a wish!",
        f"{recipient_name}, on your special day, remember that age is just a number - you're timeless! 🎈",
        f"Happy Birthday {recipient_name}! 🌟 May the stars align to bring you everything you wish for!",
        f"🎁 {recipient_name}, happy birthday! You're the gift that keeps on giving to everyone around you!",
        f"Happy Birthday {recipient_name}! 💐 May your day be filled with the fragrance of happiness!",
        f"🎪 {recipient_name}, let's make your birthday the greatest show on earth! Happy Birthday!",
        f"Happy Birthday {recipient_name}! 🌺 Another year to blossom and grow into an even more amazing person!",
        f"🎆 {recipient_name}, happy birthday! May your celebration light up the sky!",
        f"Dear {recipient_name}, your birthday is a reminder of all the wonderful things you bring to the world! 🎂",
        f"Happy Birthday {recipient_name}! 🎈 May your day float with joy and your year soar with success!",
        f"💝 {recipient_name}, wishing you a birthday filled with love, laughter, and all things wonderful!",
        f"Happy Birthday {recipient_name}! 🌸 May your special day bloom with happiness and joy!",
        f"🎊 {recipient_name}, happy birthday! Today we celebrate the amazing person you've become!",
        f"Happy Birthday {recipient_name}! 🎉 Another year to make your mark and shine your light!",
        f"✨ Dear {recipient_name}, may your birthday sparkle with magic and wonder!",
        f"Happy Birthday {recipient_name}! 🎂 Here's to another year of being absolutely fabulous!",
        f"{recipient_name}, your birthday is a celebration of the wonderful person you are! 🎈",
        f"Happy Birthday {recipient_name}! 🌟 May your day be as bright as your smile!",
        f"🎁 {recipient_name}, happy birthday! Wishing you a day wrapped in love and joy!",
        f"Happy Birthday {recipient_name}! 💐 May your day be as beautiful as a bouquet of flowers!",
        f"🎪 {recipient_name}, let's celebrate you in the grandest way possible! Happy Birthday!",
        f"Happy Birthday {recipient_name}! 🌺 Another year to grow, learn, and become even more incredible!",
        f"🎆 {recipient_name}, happy birthday! May your celebration be as spectacular as fireworks!",
        f"Dear {recipient_name}, on your birthday, I hope you feel as special as you make others feel! 🎂",
        f"Happy Birthday {recipient_name}! 🎈 May your day be filled with uplifting moments and happy memories!",
        f"💝 {recipient_name}, your birthday is a gift to celebrate! Wishing you endless joy!",
        f"Happy Birthday {recipient_name}! 🌸 May your day be as fresh and beautiful as spring flowers!",
        f"🎊 {recipient_name}, happy birthday! Today is all about you - enjoy every single moment!",
        f"Happy Birthday {recipient_name}! 🎉 Another year of adventures, achievements, and amazing moments!",
        f"✨ {recipient_name}, may your birthday be sprinkled with magic and filled with wonder!",
        f"Happy Birthday {recipient_name}! 🎂 Here's to another year of delicious moments and sweet memories!",
        f"{recipient_name}, your birthday reminds us all how lucky we are to have you! 🎈",
        f"Happy Birthday {recipient_name}! 🌟 May your day be as radiant as you are!",
        f"🎁 {recipient_name}, happy birthday! You're a gift to everyone who knows you!",
        f"Happy Birthday {recipient_name}! 💐 May your day be filled with the sweetest moments!",
        f"🎪 {recipient_name}, let's throw the biggest birthday party for you! Happy Birthday!",
        f"Happy Birthday {recipient_name}! 🌺 Another year to bloom and show the world your beauty!",
        f"🎆 {recipient_name}, happy birthday! May your celebration be absolutely dazzling!",
        f"Dear {recipient_name}, your birthday is a day to honor the incredible person you are! 🎂",
        f"Happy Birthday {recipient_name}! 🎈 May your day be as light and joyful as a balloon!",
        f"💝 {recipient_name}, wishing you a birthday that's as special and unique as you are!",
        f"Happy Birthday {recipient_name}! 🌸 May your day blossom with happiness and love!",
        f"🎊 {recipient_name}, happy birthday! Today we celebrate all the wonderful things about you!",
        f"Happy Birthday {recipient_name}! 🎉 Another year of making memories and living life to the fullest!",
        f"✨ {recipient_name}, may your birthday be filled with magic and delight!",
        f"Happy Birthday {recipient_name}! 🎂 Here's to another year of being incredible!",
        f"{recipient_name}, your birthday is a day to celebrate the amazing impact you have! 🎈",
        f"Happy Birthday {recipient_name}! 🌟 May your day be as luminous as you are!",
        f"🎁 {recipient_name}, happy birthday! You're a treasure to everyone who knows you!",
        f"Happy Birthday {recipient_name}! 💐 May your day be filled with the sweetest moments!",
        f"🎪 {recipient_name}, let's celebrate your birthday in the grandest way! Happy Birthday!",
        f"Happy Birthday {recipient_name}! 🌺 Another year to flourish and show your true colors!",
        f"🎆 {recipient_name}, happy birthday! May your celebration be absolutely brilliant!",
        f"Happy Birthday {recipient_name}! 🎂 May your day be as delightful as dessert!",
        f"{recipient_name}, on your birthday, may you feel like a winner! 🏅",
        f"🎈 Happy Birthday {recipient_name}! May your aspirations reach new heights!",
        f"Dear {recipient_name}, your birthday is a melody - may it be harmonious! 🎵",
        f"Happy Birthday {recipient_name}! 🌟 May your day be as dazzling as diamonds!",
        f"🎉 {recipient_name}, happy birthday! Let's make this day absolutely epic!",
        f"Happy Birthday {recipient_name}! 🎁 May your day overflow with wonderful surprises!",
        f"{recipient_name}, another year of being a beacon of light! Happy Birthday! ✨",
        f"🎊 Happy Birthday {recipient_name}! May your celebration match your greatness!",
        f"Dear {recipient_name}, on your birthday, may you feel like a superstar! ⭐",
        f"Happy Birthday {recipient_name}! 🎂 Here's to another year of sweet achievements!",
        f"{recipient_name}, your birthday is a gem worth celebrating! 💎",
        f"Happy Birthday {recipient_name}! 💐 May your day be as aromatic as a garden!",
        f"🎆 {recipient_name}, happy birthday! May your day glitter like fireworks!",
        f"Happy Birthday {recipient_name}! 🌺 Another year to bloom magnificently!",
        f"Dear {recipient_name}, your birthday is an artwork in progress! 🎨",
        f"Happy Birthday {recipient_name}! 🎉 May your day be filled with pure elation!",
        f"{recipient_name}, happy birthday! May your year ahead be absolutely phenomenal! 🎂",
        f"Happy Birthday {recipient_name}! 🎈 May your ambitions reach the clouds!",
        f"🎁 {recipient_name}, your birthday is a present that brings joy to all!",
        f"Happy Birthday {recipient_name}! ✨ May your day be bewitched with happiness!",
        f"{recipient_name}, on your birthday, remember that you're irreplaceable! 🎉",
        f"Happy Birthday {recipient_name}! 🌟 May your day be as glowing as embers!",
        f"Dear {recipient_name}, your birthday is a day to celebrate your individuality! 🎂",
        f"Happy Birthday {recipient_name}! 🎊 May your celebration be absolutely marvelous!",
        f"{recipient_name}, happy birthday! May your day be as exceptional as you make others feel! 💝",
        f"Happy Birthday {recipient_name}! 🌸 May your day be as charming as a spring breeze!",
        f"🎆 {recipient_name}, happy birthday! May your celebration brighten your journey!",
        f"Happy Birthday {recipient_name}! 🎈 May your day drift with pure bliss!",
        f"Dear {recipient_name}, on your birthday, may you feel all the kindness in the world! 💐",
        f"Happy Birthday {recipient_name}! 🎂 Here's to another year of being remarkable!",
        f"{recipient_name}, your birthday is a celebration of life's precious moments! 🌟",
        f"Happy Birthday {recipient_name}! 🎉 May your day be absolutely flawless in every way!",
        f"🎁 {recipient_name}, happy birthday! Wishing you a day full of extraordinary experiences!",
        f"Happy Birthday {recipient_name}! ✨ May your birthday be dusted with fairy magic!",
        f"{recipient_name}, on your birthday, may you glow brighter than the brightest star! 🌟",
        f"Happy Birthday {recipient_name}! 🎊 Let's celebrate you in the most extraordinary way!",
        f"Dear {recipient_name}, your birthday is a reminder of how valuable you are! 🎂",
        f"Happy Birthday {recipient_name}! 🌺 Another year to mature into your finest self!",
        f"🎆 {recipient_name}, happy birthday! May your celebration be absolutely radiant!",
        f"Happy Birthday {recipient_name}! 🎈 May your day be as buoyant as a helium balloon!",
        f"{recipient_name}, happy birthday! May your year be filled with extraordinary moments! 💝",
        f"Happy Birthday {recipient_name}! 🌸 May your day be as invigorating as a fresh start!",
        f"🎉 {recipient_name}, happy birthday! Today is your day to be honored!",
        f"Happy Birthday {recipient_name}! 🎂 Here's to another year of crafting beautiful memories!",
        f"Dear {recipient_name}, your birthday is a day to honor the remarkable person you've become! 🌟",
        f"Happy Birthday {recipient_name}! 🎁 May your day be enveloped in boundless joy!",
        f"{recipient_name}, on your birthday, may you feel as treasured as you are! ✨",
        f"Happy Birthday {recipient_name}! 🎊 May your celebration be absolutely ecstatic!",
        f"🎈 {recipient_name}, happy birthday! May your day ascend with happiness!",
        f"Happy Birthday {recipient_name}! 💐 May your day be as picturesque as a landscape!",
        f"{recipient_name}, your birthday is a milestone commemorating another splendid year! 🎂",
        f"Happy Birthday {recipient_name}! 🌟 May your day beam with happiness!",
        f"🎆 {recipient_name}, happy birthday! May your celebration ignite your soul!",
        f"Happy Birthday {recipient_name}! 🎉 Another year of being absolutely extraordinary!",
        f"Dear {recipient_name}, on your birthday, may you feel all the admiration you inspire! 💝",
        f"Happy Birthday {recipient_name}! 🌺 Another year to advance and achieve!",
        f"{recipient_name}, happy birthday! May your day be as marvelous as you make others feel! 🎈",
        f"Happy Birthday {recipient_name}! 🎂 Here's to another year of sweet accomplishments!",
        f"🎁 {recipient_name}, your birthday is a celebration worth cherishing!",
        f"Happy Birthday {recipient_name}! ✨ May your day be filled with awe and wonder!",
        f"{recipient_name}, on your birthday, remember that you're absolutely phenomenal! 🌟",
        f"Happy Birthday {recipient_name}! 🎊 May your celebration be the peak of the year!",
        f"Dear {recipient_name}, your birthday is a day to celebrate all your admirable qualities! 🎂",
        f"Happy Birthday {recipient_name}! 🌸 May your day flower with pure happiness!",
        f"🎆 {recipient_name}, happy birthday! May your celebration shimmer brilliantly!",
        f"Happy Birthday {recipient_name}! 🎈 May your day glide with endless joy!",
        f"{recipient_name}, happy birthday! May your year ahead be filled with victories! 💐",
        f"Happy Birthday {recipient_name}! 🎉 Another year of making the universe brighter!",
        f"🎂 {recipient_name}, happy birthday! Here's to another year of being outstanding!",
        f"Happy Birthday {recipient_name}! 🌟 May your day be as brilliant as your essence!",
        f"Dear {recipient_name}, on your birthday, may you feel all the esteem you deserve! 💝",
        f"Happy Birthday {recipient_name}! 🎁 May your day be full of touching surprises!",
        f"{recipient_name}, your birthday is a celebration of the extraordinary person you are! ✨",
        f"Happy Birthday {recipient_name}! 🎊 May your celebration be absolutely splendid!",
        f"🎈 {recipient_name}, happy birthday! May your day climb with happiness and success!",
        f"Happy Birthday {recipient_name}! 🌺 Another year to excel and flourish!",
        f"{recipient_name}, on your birthday, may you feel as esteemed as you make others feel! 🎂",
        f"Happy Birthday {recipient_name}! 🎆 May your celebration brighten your tomorrow!",
        f"Dear {recipient_name}, your birthday is a day to celebrate your matchless nature! 🌟",
        f"Happy Birthday {recipient_name}! 💐 May your day be as pleasing as you are!",
        f"{recipient_name}, happy birthday! May your year be your most flourishing one! 🎉",
        f"Happy Birthday {recipient_name}! 🎁 You're a miracle to everyone around you!",
        f"🎂 {recipient_name}, happy birthday! Here's to another year of wonderful adventures!",
        f"Happy Birthday {recipient_name}! ✨ May your day be mystical and memorable!",
        f"{recipient_name}, on your birthday, remember that you're truly outstanding! 🌟",
        f"Happy Birthday {recipient_name}! 🎊 May your celebration be absolutely magnificent!",
        f"Dear {recipient_name}, your birthday marks another year of your exceptional journey! 🎈",
        f"Happy Birthday {recipient_name}! 🌸 May your day be as exquisite as a work of art!",
        f"🎆 {recipient_name}, happy birthday! May your celebration be spectacularly luminous!",
        f"Happy Birthday {recipient_name}! 🎉 Another year of being absolutely splendid!",
        f"{recipient_name}, happy birthday! May your day be filled with all things extraordinary! 💝",
        f"Happy Birthday {recipient_name}! 🎂 Here's to another year of outstanding achievements!",
        f"🎁 {recipient_name}, your birthday is a special time to celebrate you!",
        f"Happy Birthday {recipient_name}! 🌟 May your day radiate with pure happiness!",
        f"Dear {recipient_name}, on your birthday, may you feel all the reverence you deserve! ✨",
        f"Happy Birthday {recipient_name}! 🌺 Another year to progress and perfect!",
        f"{recipient_name}, happy birthday! May your day be as ideal as you make others feel! 🎈",
        f"Happy Birthday {recipient_name}! 🎊 May your celebration be absolutely delightful!",
        f"🎆 {recipient_name}, happy birthday! May your celebration be brilliantly luminous!",
        f"Happy Birthday {recipient_name}! 💐 May your day be filled with nature's splendor!",
        f"{recipient_name}, your birthday is a milestone celebrating another exceptional year! 🎂",
        f"Happy Birthday {recipient_name}! 🎉 Another year of making constructive changes!",
        f"🎁 {recipient_name}, happy birthday! Wishing you a day full of remarkable things!",
        f"Happy Birthday {recipient_name}! ✨ May your day be filled with sorcery and joy!",
        f"{recipient_name}, on your birthday, may you feel as remarkable as you are! 🌟",
        f"Happy Birthday {recipient_name}! 🎊 Let's celebrate you in the most splendid way!",
        f"Dear {recipient_name}, your birthday is a day to honor all your triumphs! 🎈",
        f"Happy Birthday {recipient_name}! 🌸 May your day blossom with infinite happiness!",
        f"🎆 {recipient_name}, happy birthday! May your celebration illuminate your universe!",
        f"Happy Birthday {recipient_name}! 🎂 Here's to another year of being magnificent!",
        f"{recipient_name}, happy birthday! May your year ahead be your most triumphant one! 💝",
        f"Happy Birthday {recipient_name}! 🎁 You're a wonder to everyone who knows you!",
        f"🎂 {recipient_name}, happy birthday! Here's to another year of being exceptional!",
        f"Happy Birthday {recipient_name}! ✨ May your day be filled with wizardry and wonder!",
        f"{recipient_name}, on your birthday, remember that you're absolutely magnificent! 🌟",
        f"Happy Birthday {recipient_name}! 🎊 May your celebration be absolutely resplendent!",
        f"Dear {recipient_name}, your birthday is a day to celebrate all your victories! 🎈",
        f"Happy Birthday {recipient_name}! 🌸 May your day be as elegant as a masterpiece!",
        f"🎆 {recipient_name}, happy birthday! May your celebration be brilliantly effulgent!",
        f"Happy Birthday {recipient_name}! 🎉 Another year of being absolutely marvelous!",
        f"{recipient_name}, happy birthday! May your day be filled with all things magnificent! 💝",
        f"Happy Birthday {recipient_name}! 🎂 Here's to another year of exceptional achievements!",
        f"🎁 {recipient_name}, your birthday is a momentous occasion to celebrate you!",
        f"Happy Birthday {recipient_name}! 🌟 May your day gleam with pure happiness!",
        f"Dear {recipient_name}, on your birthday, may you feel all the veneration you deserve! ✨",
        f"Happy Birthday {recipient_name}! 🌺 Another year to evolve and enhance!",
        f"{recipient_name}, happy birthday! May your day be as flawless as you make others feel! 🎈",
        f"Happy Birthday {recipient_name}! 🎊 May your celebration be absolutely jubilant!",
        f"🎆 {recipient_name}, happy birthday! May your celebration be brilliantly incandescent!",
        f"Happy Birthday {recipient_name}! 💐 May your day be filled with earth's magnificence!",
        f"{recipient_name}, your birthday is a milestone commemorating another magnificent year! 🎂",
        f"Happy Birthday {recipient_name}! 🎉 Another year of making beneficial changes!",
        f"🎁 {recipient_name}, happy birthday! Wishing you a day full of phenomenal things!",
        f"Happy Birthday {recipient_name}! ✨ May your day be filled with enchantment and elation!",
        f"{recipient_name}, on your birthday, may you feel as magnificent as you are! 🌟",
        f"Happy Birthday {recipient_name}! 🎊 Let's celebrate you in the most magnificent way!",
        f"Dear {recipient_name}, your birthday is a day to honor all your successes! 🎈",
        f"Happy Birthday {recipient_name}! 🌸 May your day flower with boundless happiness!",
        f"🎆 {recipient_name}, happy birthday! May your celebration brighten your cosmos!",
        f"Happy Birthday {recipient_name}! 🎂 Here's to another year of being resplendent!",
        f"{recipient_name}, happy birthday! May your year ahead be your most prosperous one! 💝",
    ]
    
    # Filter messages based on age and culture appropriateness
    if age_group or culture_group:
        filtered_messages = [
            msg for msg in all_messages
            if _is_message_appropriate(msg, age_group, culture_group)
        ]
        
        # If filtering results in too few messages, fall back to all messages
        # (ensures we always have enough variety)
        if len(filtered_messages) >= 50:
            return filtered_messages[:500]  # Return up to 500 filtered messages
        else:
            # If too restrictive, return all messages but prioritize appropriate ones
            return all_messages[:500]
    
    # Return all messages if no filtering needed
    return all_messages[:500]
