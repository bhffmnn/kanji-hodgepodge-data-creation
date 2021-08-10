# !/usr/bin/python3

import json
import re
import xml.sax
import sys


class WiktionaryHandler(xml.sax.ContentHandler):
    def __init__(self):
        self.currentTag = ""
        self.currentTitle = ""
        self.isCurrentlyOn = False
        self.currentString = ""
        self.results = []

    def startElement(self, tag, attributes):
        self.currentTag = tag

    def endElement(self, tag):
        self.currentTag = ""
        if tag == "text" and self.currentString != "":
            # Get rid of notes etc. that appear in certain articles
            # This appears in several articles
            reading_string = re.sub(r"Wiktionary:漢字索引 音訓.+\|", "", self.currentString)
            # This appears in 弁
            reading_string = re.sub(r"、（瓣の代替字として）\[\[ハン]]", "", reading_string)
            # This appears in 閒 maybe more
            reading_string = re.sub(r"（\[\[連濁]]あり）", "", reading_string)
            # This appears in 火 maybe more
            reading_string = re.sub(r"（例：\[\[火災]]、\[\[火事]]、\[\[灯火]]）", "", reading_string)
            # This appears in 㢱 maybe more
            reading_string = re.sub(r"（\[\[万葉仮名]]）", "", reading_string)
            # This appears in 欠
            reading_string = re.sub(r"（←「\[\[缺]]」の音）", "", reading_string)
            # Remove examples from 上
            reading_string = re.sub(r"例．\[\[..]]（[^）]+）", "", reading_string)
            # Remove notes from 出, 石, 海 etc
            reading_string = re.sub(r"（[^）]+）", "", reading_string)
            # Remove note from 皇
            reading_string = re.sub(r"（[^）]+）", "", reading_string)
            reading_string = re.sub(r"「\[\[天皇]]」の「ノウ」は「オウ」の\[\[連声]]", "", reading_string)
            # This appears in 兄
            reading_string = re.sub(r"（古代音：クヰャウ）", "", reading_string)
            # 訓 has 唐音|唐宋音
            reading_string = re.sub(r"\|唐宋音", "", reading_string)

            reading_string = re.sub(r"\s", "", reading_string)  # Remove spaces
            reading_string = re.sub(r"：", ":", reading_string)  # Normalize ':'

            readings = []
            for s in reading_string.split("**"):
                if s != "":
                    types_and_readings = s.split(":") # 1 = readings, 0 = types
                    types_and_readings[0] = re.compile(r"\[\[[^]]+]]").findall(types_and_readings[0])
                    types_and_readings[1] = re.compile(r"\[\[[^]]+]]").findall(types_and_readings[1])
                    square_rgx = re.compile(r"[\[\]]")
                    type_strings = []
                    reading_strings = []
                    for t in types_and_readings[0]:
                        type_strings.append(re.sub(square_rgx, "", t))
                    for r1 in types_and_readings[1]:
                        for r2 in re.compile("[,、|・]").split(r1):
                            reading_strings.append(re.sub(square_rgx, "", r2))
                    for r in reading_strings:
                        readings.append({"value": r, "types": type_strings})
            self.results.append({"literal": self.currentTitle, "readings": readings})

            self.currentString = ""
            self.isCurrentlyOn = False

    def characters(self, content):
        if self.currentTag == "title":
            self.currentTitle = content
        elif (self.currentTag == "text" and self.currentTitle != "她" and self.currentTitle != "妳"
              and self.currentTitle != "郥" and self.currentTitle != "酛" and not self.currentTitle.__contains__(":")):
            # 她 and 妳 have ?? readings in Japanese, 郥 doesn't properly have type, 酛 has no proper on readings,
            # ":" filters out templates etc
            if content.__contains__("* 音読み"):
                self.isCurrentlyOn = True
            elif self.isCurrentlyOn:
                # last two groups are needed because for some reason readings of 扇 and 楼 get ripped apart into two lines
                if re.compile(r"^(\*\* ?\[\[(呉音|漢音|唐音|慣用音)|]]|: \[\[ル\]\])").search(content):
                    self.currentString += content
                elif content.startswith("*** 灯"):  # The article for 灯 has split readings for 灯 and 燈
                    self.currentString += content[content.index(":"):]
                elif content.__contains__("訓読み") or content.startswith("="):
                    self.isCurrentlyOn = False


if __name__ == "__main__":
    parser = xml.sax.make_parser()
    # turn off name spaces
    parser.setFeature(xml.sax.handler.feature_namespaces, 0)
    handler = WiktionaryHandler()
    parser.setContentHandler(handler)
    parser.parse(open(sys.argv[1], "r"))
    
    wiktionary_readings_json = json.dumps(handler.results, ensure_ascii=False)
    print(wiktionary_readings_json)
