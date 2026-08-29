# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Tests for A2UI Layout Template Merger (`merger.py`)."""

import unittest

from app.merger import merge_template
from app.router_config import IntentClass, RouterClassification


class TestMerger(unittest.TestCase):
    """Tests for A2UI Layout Template Merger."""

    def test_merge_unknown_template_raises_error(self):
        """Verifies that an unknown template raises FileNotFoundError."""
        with self.assertRaises(FileNotFoundError):
            merge_template("non_existent_template", {"text": "hello"})

    def test_merge_text_only(self):
        """Verifies that text-only response is merged correctly."""
        data = {
            "surface_id": "text-only-surface-123",
            "text": "MLIT search completed with no results.",
        }
        result = merge_template("text_only", data)
        self.assertEqual(len(result), 2)
        surface_dict = dict(result[0])
        self.assertIn("createSurface", surface_dict)
        self.assertEqual(
            surface_dict["createSurface"]["surfaceId"], "text-only-surface-123"
        )

    def test_merge_local_search(self):
        """Verifies that local search response is merged correctly."""
        data = {
            "surface_id": "local-search-surface-abc",
            "summary": "Found shelters in Saitama city.",
            "center_lat": 35.8639,
            "center_lng": 139.6405,
            "zoom": 14,
            "places": [
                {
                    "placeId": "saitama_shelter_1",
                    "name": "Nakacho Elementary School",
                    "lat": 35.8612,
                    "lng": 139.6421,
                }
            ],
            "anchor_marker": {
                "lat": 35.8639,
                "lng": 139.6405,
                "label": "Saitama City Hall",
            },
        }
        result = merge_template("local_search", data)
        self.assertEqual(len(result), 3)
        res_0 = dict(result[0])
        res_2 = dict(result[2])
        self.assertEqual(
            res_0["createSurface"]["surfaceId"], "local-search-surface-abc"
        )
        self.assertEqual(
            res_2["updateDataModel"]["surfaceId"], "local-search-surface-abc"
        )

    def test_router_classification_schema(self):
        """Verifies RouterClassification schema parsing."""
        classification = RouterClassification(
            intent=IntentClass.LOCAL_SEARCH,
            query="Shelters near Saitama City Hall",
        )
        self.assertEqual(classification.intent, IntentClass.LOCAL_SEARCH)
