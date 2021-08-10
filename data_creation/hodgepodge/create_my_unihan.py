# !/usr/bin/python3

import json
import sys

unihan_variants_txt = open(sys.argv[1], "r")
unihan_radicalstrokecounts_txt = open(sys.argv[2], "r")

unihan_variants_dict = {}
for line in unihan_variants_txt:
    if line.startswith("U"):
        line = line[:-1] # get rid of line break
        fields = line.split("\t") 
        literal_cp = int(fields[0][2:], 16) # get rid of U+ and convert hex string to int
        if not literal_cp in unihan_variants_dict:
            unihan_variants_dict.update({literal_cp: []})
        variant_type = fields[1]
        variant_cps = fields[2].split(" ")
        variants = []
        for variant_cp in variant_cps:
            if variant_cp.__contains__("<"):
                v_fields = variant_cp.split("<")
                variants.append({"codepoint": int(v_fields[0][2:], 16), "type": variant_type, "sources": v_fields[1].split(",")})
            else:
                variants.append({"codepoint": int(variant_cp[2:], 16), "type": variant_type, "sources": []})
        unihan_variants_dict.update({literal_cp: unihan_variants_dict.get(literal_cp) + variants})

my_unihan_list = []
for line in unihan_radicalstrokecounts_txt:
    if line.startswith("U"):
        fields = line.split("\t")
        if fields[1] == "kRSAdobe_Japan1_6": # That's the only type we need
            count_parts = fields[2].split(" ")[0].split("+")[2].split(".");
            stroke_count = int(count_parts[1]) + int(count_parts[2])            
            codepoint = int(fields[0][2:], 16)
            variants = []
            if codepoint in unihan_variants_dict:
                variants = unihan_variants_dict[codepoint]
            my_unihan_list.append({"codepoint": codepoint, "stroke_count": stroke_count, "variants": variants})

print(json.dumps(my_unihan_list, ensure_ascii=False))