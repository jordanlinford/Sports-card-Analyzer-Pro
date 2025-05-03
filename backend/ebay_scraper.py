import requests
from bs4 import BeautifulSoup
import re
from typing import List, Dict, Optional

class EbayScraper:
    def __init__(self):
        self.base_url = "https://www.ebay.com/sch/i.html"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }

    def _build_search_url(self, player_name: str, year: Optional[str] = None, 
                         card_set: Optional[str] = None, variation: Optional[str] = None,
                         card_number: Optional[str] = None) -> str:
        search_terms = [player_name]
        
        if year:
            search_terms.append(year)
        if card_set:
            search_terms.append(card_set)
        if variation:
            search_terms.append(variation)
        if card_number:
            search_terms.append(f"#{card_number}")
            
        search_query = " ".join(search_terms)
        return f"{self.base_url}?_nkw={search_query}&_sacat=0&LH_Sold=1&LH_Complete=1"

    def _extract_price(self, price_text: str) -> float:
        # Remove currency symbols and commas, then convert to float
        return float(re.sub(r'[^\d.]', '', price_text))

    def search_cards(self, player_name: str, year: Optional[str] = None,
                    card_set: Optional[str] = None, variation: Optional[str] = None,
                    card_number: Optional[str] = None, scenario: str = "Mint") -> List[Dict]:
        try:
            url = self._build_search_url(player_name, year, card_set, variation, card_number)
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            items = soup.find_all('div', class_='s-item__info')
            
            results = []
            for item in items:
                try:
                    title = item.find('div', class_='s-item__title').text.strip()
                    price_element = item.find('span', class_='s-item__price')
                    
                    if price_element:
                        price = self._extract_price(price_element.text)
                        results.append({
                            'title': title,
                            'price': price
                        })
                except (AttributeError, ValueError):
                    continue
                    
            return results
        except Exception as e:
            print(f"Error scraping eBay: {str(e)}")
            return []
