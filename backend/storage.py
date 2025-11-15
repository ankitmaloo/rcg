"""
Simple file-based storage for landing pages.
Each landing page is stored as a JSON file in data/landing-pages/
"""
import os
import json
import uuid
from datetime import datetime
from typing import Optional, List, Dict
from pathlib import Path
import re


class LandingPageStorage:
    def __init__(self, base_dir: str = "data/landing-pages"):
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _generate_slug(self, brand_name: str, custom_slug: Optional[str] = None) -> str:
        """Generate a URL-friendly slug"""
        if custom_slug:
            base_slug = custom_slug
        else:
            base_slug = brand_name if brand_name else "landing-page"

        # Convert to lowercase and replace spaces/special chars with hyphens
        slug = re.sub(r'[^a-z0-9]+', '-', base_slug.lower())
        slug = slug.strip('-')

        # Add short unique ID
        short_id = str(uuid.uuid4())[:8]
        return f"{slug}-{short_id}"

    def _slug_exists(self, slug: str) -> bool:
        """Check if slug already exists"""
        for file_path in self.base_dir.glob("*.json"):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if data.get('slug') == slug:
                        return True
            except:
                continue
        return False

    def save_landing_page(
        self,
        html_content: str,
        brand_kit: Optional[Dict] = None,
        ab_variant_html: Optional[str] = None,
        seo_metadata: Optional[Dict] = None,
        custom_slug: Optional[str] = None
    ) -> Dict:
        """Save a landing page and return its metadata with URL"""

        # Generate unique ID and slug
        page_id = str(uuid.uuid4())
        brand_name = brand_kit.get('name', '') if brand_kit else ''
        slug = self._generate_slug(brand_name, custom_slug)

        # Ensure slug is unique (regenerate if collision)
        while self._slug_exists(slug):
            slug = self._generate_slug(brand_name, custom_slug)

        # Create landing page object
        landing_page = {
            "id": page_id,
            "slug": slug,
            "html_content": html_content,
            "ab_variant_html": ab_variant_html,
            "brand_kit": brand_kit or {},
            "seo_metadata": seo_metadata or {},
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "views_count": 0,
            "is_public": True
        }

        # Save to file
        file_path = self.base_dir / f"{page_id}.json"
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(landing_page, f, indent=2, ensure_ascii=False)

        # Return metadata (without full HTML content to save bandwidth)
        return {
            "id": page_id,
            "slug": slug,
            "brand_name": brand_name,
            "created_at": landing_page["created_at"],
            "has_ab_variant": ab_variant_html is not None
        }

    def get_by_slug(self, slug: str) -> Optional[Dict]:
        """Retrieve landing page by slug"""
        for file_path in self.base_dir.glob("*.json"):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if data.get('slug') == slug:
                        # Increment view count
                        data['views_count'] = data.get('views_count', 0) + 1
                        with open(file_path, 'w', encoding='utf-8') as fw:
                            json.dump(data, fw, indent=2, ensure_ascii=False)
                        return data
            except Exception as e:
                print(f"Error reading {file_path}: {e}")
                continue
        return None

    def get_by_id(self, page_id: str) -> Optional[Dict]:
        """Retrieve landing page by ID"""
        file_path = self.base_dir / f"{page_id}.json"
        if file_path.exists():
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error reading {file_path}: {e}")
        return None

    def list_all(self, limit: int = 100) -> List[Dict]:
        """List all landing pages (metadata only, no HTML content)"""
        pages = []
        for file_path in sorted(self.base_dir.glob("*.json"), key=os.path.getmtime, reverse=True):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    # Return metadata only
                    pages.append({
                        "id": data.get("id"),
                        "slug": data.get("slug"),
                        "brand_name": data.get("brand_kit", {}).get("name", "Untitled"),
                        "created_at": data.get("created_at"),
                        "views_count": data.get("views_count", 0),
                        "has_ab_variant": bool(data.get("ab_variant_html"))
                    })

                    if len(pages) >= limit:
                        break
            except Exception as e:
                print(f"Error reading {file_path}: {e}")
                continue

        return pages

    def delete(self, page_id: str) -> bool:
        """Delete a landing page by ID"""
        file_path = self.base_dir / f"{page_id}.json"
        if file_path.exists():
            try:
                file_path.unlink()
                return True
            except Exception as e:
                print(f"Error deleting {file_path}: {e}")
        return False

    def update_slug(self, page_id: str, new_slug: str) -> bool:
        """Update the slug of a landing page"""
        data = self.get_by_id(page_id)
        if not data:
            return False

        # Check if new slug already exists
        if self._slug_exists(new_slug):
            return False

        data['slug'] = new_slug
        data['updated_at'] = datetime.utcnow().isoformat()

        file_path = self.base_dir / f"{page_id}.json"
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"Error updating {file_path}: {e}")
            return False
