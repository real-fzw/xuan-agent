from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import platform
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


MAX_CHARS = 900


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def split_text(text: str, max_chars: int = MAX_CHARS) -> list[str]:
    normalized = text.replace("\r\n", "\n").strip()
    paragraphs = [part.strip() for part in normalized.split("\n\n") if part.strip()]
    chunks: list[str] = []
    for paragraph in paragraphs or ([normalized] if normalized else []):
        for offset in range(0, len(paragraph), max_chars):
            chunk = paragraph[offset : offset + max_chars].strip()
            if chunk:
                chunks.append(chunk)
    return chunks


def bbox_from_provenance(provenance: dict[str, Any]) -> list[float] | None:
    bbox = provenance.get("bbox")
    if not isinstance(bbox, dict):
        return None
    values = [bbox.get("l"), bbox.get("t"), bbox.get("r"), bbox.get("b")]
    if not all(isinstance(value, (int, float)) for value in values):
        return None
    return values


def docling_blocks(
    input_path: Path, enable_ocr: bool
) -> tuple[list[dict[str, Any]], str, str]:
    from docling.datamodel.base_models import InputFormat
    from docling.datamodel.pipeline_options import PdfPipelineOptions
    from docling.document_converter import DocumentConverter, PdfFormatOption

    version = importlib.metadata.version("docling")
    if input_path.suffix.lower() == ".pdf":
        pipeline_options = PdfPipelineOptions(
            do_ocr=enable_ocr,
            do_table_structure=False,
        )
        converter = DocumentConverter(
            format_options={
                InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options)
            }
        )
    else:
        converter = DocumentConverter()
    document = converter.convert(str(input_path)).document.export_to_dict()
    blocks: list[dict[str, Any]] = []

    for text_index, item in enumerate(document.get("texts", []), start=1):
        text = item.get("text")
        if not isinstance(text, str) or not text.strip():
            continue
        provenance_items = item.get("prov") or []
        provenance = provenance_items[0] if provenance_items else {}
        page = provenance.get("page_no")
        bbox = bbox_from_provenance(provenance)
        label = item.get("label") if isinstance(item.get("label"), str) else "text"

        for chunk_index, chunk in enumerate(split_text(text), start=1):
            locator = f"{label} {text_index}"
            if isinstance(page, int):
                locator = f"page {page}, {locator}"
            blocks.append(
                {
                    "id": f"text-{text_index}-{chunk_index}",
                    "type": label,
                    "text": chunk,
                    "locator": locator,
                    "page": page if isinstance(page, int) else None,
                    "bbox": bbox,
                }
            )

    return blocks, "docling", version


def textutil_blocks(input_path: Path) -> tuple[list[dict[str, Any]], str, str]:
    if platform.system() != "Darwin":
        raise RuntimeError("macOS textutil fallback is only available on Darwin.")
    result = subprocess.run(
        ["/usr/bin/textutil", "-convert", "txt", "-stdout", str(input_path)],
        check=True,
        capture_output=True,
    )
    text = result.stdout.decode("utf-8", errors="replace")
    blocks = [
        {
            "id": f"text-{index}",
            "type": "text",
            "text": chunk,
            "locator": f"paragraph {index}",
            "page": None,
            "bbox": None,
        }
        for index, chunk in enumerate(split_text(text), start=1)
    ]
    return blocks, "macos-textutil", platform.mac_ver()[0] or "unknown"


def extract(input_path: Path, source_hint: str, enable_ocr: bool = False) -> dict[str, Any]:
    extension = input_path.suffix.lower()
    if extension in {".pdf", ".docx", ".pptx"}:
        blocks, extractor_id, extractor_version = docling_blocks(input_path, enable_ocr)
    elif extension in {".doc", ".ppt"}:
        blocks, extractor_id, extractor_version = textutil_blocks(input_path)
    else:
        raise RuntimeError(f"Unsupported document type: {extension or 'unknown'}")

    source_hash = sha256_bytes(input_path.read_bytes())
    confidence = "experimental"
    for block in blocks:
        block["trace"] = {
            "rulesetId": "rag.document-extraction-v1",
            "formulaId": f"extract.{extractor_id}.{extractor_version}",
            "sourceHint": source_hint,
            "confidence": confidence,
        }

    return {
        "version": 1,
        "kind": "document-extraction",
        "sourcePath": source_hint,
        "sourceHash": source_hash,
        "extractor": {
            "id": extractor_id,
            "version": extractor_version,
            "options": {"ocr": enable_ocr, "tableStructure": False},
        },
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "blocks": blocks,
        "warnings": [] if blocks else ["Extractor returned no text blocks."],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract a private document into XuanAgent JSON.")
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--source-hint")
    parser.add_argument(
        "--ocr",
        action="store_true",
        help="Enable PDF OCR explicitly. Disabled by default.",
    )
    args = parser.parse_args()

    input_path = args.input.resolve()
    output_path = args.output.resolve()
    source_hint = args.source_hint or str(input_path)
    artifact = extract(input_path, source_hint, enable_ocr=args.ocr)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(artifact, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(
        f"Wrote private extraction artifact: {output_path} "
        f"(extractor={artifact['extractor']['id']}, blocks={len(artifact['blocks'])})"
    )


if __name__ == "__main__":
    main()
