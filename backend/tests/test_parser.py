import pytest
from app.parser import parse_file, parse_text, parse_pdf, parse_docx

class TestParser:
    def test_parse_text(self):
        content = b"Hello, this is a test."
        result = parse_text(content)
        assert result == "Hello, this is a test."

    def test_parse_file_txt(self):
        content = b"Test content for parsing."
        result = parse_file(content, '.txt')
        assert result == "Test content for parsing."

    def test_parse_file_md(self):
        content = b"# Markdown Header\nSome content."
        result = parse_file(content, '.md')
        assert "# Markdown Header" in result

    def test_parse_file_unsupported(self):
        with pytest.raises(ValueError):
            parse_file(b"test", '.unsupported')

    def test_parse_text_encoding(self):
        content = "Test with special chars: é à ù".encode('utf-8')
        result = parse_text(content)
        assert "é" in result
