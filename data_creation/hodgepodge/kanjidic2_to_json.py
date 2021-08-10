# !/usr/bin/python3

import json
import xml.sax
import sys


class Kanjidic2Handler(xml.sax.ContentHandler):
    def __init__(self):
        self.currentTag = ""
        self.currentAttributes = None

        # Kanji fields
        self.currentLiteral = None
        self.currentCodePoints = []
        self.currentRadicals = []
        self.currentGrade = None
        self.currentVariants = []
        self.currentFreq = None
        self.currentRadName = None
        self.currentStrokeCount = None
        self.currentJlpt = None
        self.currentDicNumbers = []
        self.currentQueryCodes = []
        self.currentReadings = []
        self.currentMeanings = []
        self.currentNanoris = []

        self.kanjidic = []

    def startElement(self, tag, attributes):
        self.currentTag = tag
        self.currentAttributes = attributes

    def endElement(self, tag):
        self.currentTag = ""
        if tag == "character":
            currentKanji = {"literal": self.currentLiteral,
                            "codepoints": self.currentCodePoints,
                            "radicals": self.currentRadicals,
                            "grade": self.currentGrade,
                            "variants": self.currentVariants,
                            "freq": self.currentFreq,
                            "rad_name": self.currentRadName,
                            "stroke_count": self.currentStrokeCount,
                            "jlpt": self.currentJlpt,
                            "dic_numbers": self.currentDicNumbers,
                            "query_codes": self.currentQueryCodes,
                            "readings": self.currentReadings,
                            "meanings": self.currentMeanings,
                            "nanoris": self.currentNanoris}
            self.kanjidic.append(currentKanji)
            self.currentLiteral = None
            self.currentCodePoints = []
            self.currentRadicals = []
            self.currentGrade = None
            self.currentVariants = []
            self.currentFreq = None
            self.currentRadName = None
            self.currentStrokeCount = None
            self.currentJlpt = None
            self.currentDicNumbers = []
            self.currentQueryCodes = []
            self.currentReadings = []
            self.currentMeanings = []
            self.currentNanoris = []

    def characters(self, content):
        if self.currentTag == "literal":
            self.currentLiteral = content
        elif self.currentTag == "cp_value":
            self.currentCodePoints.append({"value": content, "type": self.currentAttributes.getValue("cp_type")})
        elif self.currentTag == "rad_value":
            self.currentRadicals.append({"value": int(content), "type": self.currentAttributes.getValue("rad_type")})
        elif self.currentTag == "grade":
            self.currentGrade = int(content)
        elif self.currentTag == "rad_name":
            self.currentRadName = content
        elif self.currentTag == "stroke_count":
            self.currentStrokeCount = int(content)
        elif self.currentTag == "variant":
            self.currentVariants.append({"value": content, "type": self.currentAttributes.getValue("var_type")})
        elif self.currentTag == "freq":
            self.currentFreq = int(content)
        elif self.currentTag == "nanori":
            self.currentNanoris.append(content)
        elif self.currentTag == "reading":
            # Other attributes than r_type are defined but never used
            self.currentReadings.append({"value": content, "type": self.currentAttributes.getValue("r_type")})
        elif self.currentTag == "meaning":
            m_lang = "en"
            if len(self.currentAttributes.getNames()) > 0:
                m_lang = self.currentAttributes.getValue("m_lang")
            self.currentMeanings.append({"value": content, "m_lang": m_lang})
        elif self.currentTag == "jlpt":
            self.currentJlpt = int(content)
        elif self.currentTag == "dic_ref":
            type = ""
            m_vol = None
            m_page = None
            for n in self.currentAttributes.getNames():
                if n == "dr_type":
                    type = self.currentAttributes.getValue(n)
                elif n == "m_vol":
                    m_vol = self.currentAttributes.getValue(n)
                elif n == "m_page":
                    m_page = self.currentAttributes.getValue(n)                
            self.currentDicNumbers.append({"value": content, "type": type, "m_vol": m_vol, "m_page": m_page})
        elif self.currentTag == "q_code":
            skip_misclass = None 
            if self.currentAttributes.getNames().__contains__("skip_misclass"):
                skip_misclass = self.currentAttributes.getValue("skip_misclass")
            self.currentQueryCodes.append({"value": content, "type": self.currentAttributes.getValue("qc_type"), "skip_misclass": skip_misclass})
        

if __name__ == "__main__":
    parser = xml.sax.make_parser()
    # turn off name spaces
    parser.setFeature(xml.sax.handler.feature_namespaces, 0)
    handler = Kanjidic2Handler()
    parser.setContentHandler(handler)
    parser.parse(open(sys.argv[1], "r"))
    
    kanjdic2_json = json.dumps(handler.kanjidic, ensure_ascii=False)
    print(kanjdic2_json)
