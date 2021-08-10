import json
import xml.sax
import sys
from wordfreq import get_frequency_dict


class JMdicteHandler(xml.sax.ContentHandler):
    def __init__(self):
        self.freq_dict = get_frequency_dict("ja")
        self.tag = ""
        self.attributes = [] # Not in use currently

        self.entry = {"orthForms": [], "readings": [], "meanings": []}
        self.kanjiEle = {"value": "", "infos": [], "frequency": 0}
        self.readingEle = {"value": "", "noTrueReading": False, "restrictions": [],
                            "infos": []}
        self.senseEle = {"values": [], "kanjiRestrictions": [], "readingRestrictions": [],
                            "pos": []}
        # oh boi, in jmdict pos and misc are only defined for one sense element if it is the same
        # for the subsequent elements. I haven't dealt with this yet (maybe I don't need those)
        self.wordList = []
        
    def startElement(self, tag, attributes):
        self.tag = tag
        self.attributes = attributes
        if tag == "re_nokanji":
            self.readingEle["noTrueReading"] = True;

    def endElement(self, tag):
        if tag == "k_ele":
            self.entry["orthForms"].append(self.kanjiEle)
            self.kanjiEle = {"value": "", "infos": [], "frequency": 0}
        elif tag == "r_ele":
            self.entry["readings"].append(self.readingEle)
            self.readingEle = {"value": "", "noTrueReading": False, "restrictions": [],
                            "infos": []}
        elif tag == "sense":
            self.entry["meanings"].append(self.senseEle)
            self.senseEle = {"values": [], "kanjiRestrictions": [], "readingRestrictions": [],
                            "pos": []}
        elif tag == "entry":
            if len(self.entry["orthForms"]) != 0:
                self.wordList.append(self.entry)
            self.entry = {"orthForms": [], "readings": [], "meanings": []}

        self.tag = ""
        self.attributes = []

    def characters(self, content):
        # Inside k_ele
        if self.tag == "keb":
            self.kanjiEle["value"] = content
            if content in self.freq_dict:
                self.kanjiEle["frequency"] = self.freq_dict[content]
            else:
                self.kanjiEle["frequency"] = 0
        elif self.tag == "ke_inf":
            self.kanjiEle["infos"].append(content)

        # Inside r_ele
        elif self.tag == "reb":
            self.readingEle["value"] = content
        elif self.tag == "re_inf":
            self.readingEle["infos"].append(content)
        elif self.tag == "re_restr":
            self.readingEle["restrictions"].append(content)

        # Inside sense
        if self.tag == "gloss":
            self.senseEle["values"].append(content)
        elif self.tag == "stagk":
            self.senseEle["kanjiRestrictions"].append(content)
        elif self.tag == "stagr":
            self.senseEle["readingRestrictions"].append(content)
        elif self.tag == "pos":
            self.senseEle["pos"].append(content)
        

if __name__ == "__main__":
    handler = JMdicteHandler()
    parser = xml.sax.make_parser()
    parser.setContentHandler(handler)
    parser.parse(open(sys.argv[1], "r"))
    frequency_dictionary_json = json.dumps(handler.wordList, ensure_ascii=False)
    print(frequency_dictionary_json)
