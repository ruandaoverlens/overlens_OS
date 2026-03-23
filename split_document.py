#!/usr/bin/env python3
"""Split the Overlens Brand System document into chapters and topics."""

import os
import re

INPUT_FILE = r"C:\Users\ruanb\Desktop\branding\[B] O Livro de Branding da Overlens (1).md"
OUTPUT_DIR = r"C:\Users\ruanb\Desktop\branding\Brand System"

# Read the full document
with open(INPUT_FILE, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Find all H1 positions (lines starting with "# ")
h1_positions = []
for i, line in enumerate(lines):
    if re.match(r'^# ', line) and not re.match(r'^##', line):
        title = line.strip().lstrip('# ').strip()
        h1_positions.append((i, title))

# Define the chapter structure: map H1 titles to chapters
# Each chapter groups related H1 sections together
chapter_map = {
    # Chapter 01 - Introdução
    "Introdução": ("01 - Introdução", "01 Introdução"),
    "O Livro de Branding": ("01 - Introdução", "02 O Livro de Branding"),

    # Chapter 02 - Overview
    "Overview da Overlens": ("02 - Overview da Overlens", "01 Overview da Overlens"),

    # Chapter 03 - Por que a Overlens existe
    "Por que a Overlens existe:": ("03 - Por que a Overlens existe", "01 Por que a Overlens existe"),
    "Por que a Overlens existe?": ("03 - Por que a Overlens existe", "01 Por que a Overlens existe"),
    "Expandindo a nossa visão": ("03 - Por que a Overlens existe", "02 Expandindo a nossa visão"),
    "O desafio do nosso tempo": ("03 - Por que a Overlens existe", "03 O desafio do nosso tempo"),
    "Como cumprimos nossa missão?": ("03 - Por que a Overlens existe", "04 Como cumprimos nossa missão"),
    "Porque essa é uma boa visão?": ("03 - Por que a Overlens existe", "05 Porque essa é uma boa visão"),

    # Chapter 04 - Cuidados e Riscos
    "Cuidados e Riscos": ("04 - Cuidados e Riscos", "01 Cuidados e Riscos"),
    "Nossa postura": ("04 - Cuidados e Riscos", "02 Nossa postura"),

    # Chapter 05 - O Preço
    "O preço que pagamos": ("05 - O Preço que Pagamos", "01 O preço que pagamos"),
    "Qual é o preço?": ("05 - O Preço que Pagamos", "01 O preço que pagamos"),

    # Chapter 06 - Princípios
    "Nossos Princípios": ("06 - Princípios", "01 Princípios da Overlens"),
    "Princípios da Overlens": ("06 - Princípios", "01 Princípios da Overlens"),

    # Chapter 07 - Linha do Tempo
    "Linha do Tempo": ("07 - Linha do Tempo", "01 Linha do Tempo"),

    # Chapter 08 - Posicionamento
    "Posicionamento": ("08 - Posicionamento", "01 Posicionamento"),

    # Chapter 09 - Público-chave
    "Público-chave": ("09 - Público-chave", "01 Público-chave"),

    # Chapter 10 - Buyer Personas
    "Buyer Personas": ("10 - Buyer Personas", "01 Buyer Personas"),
    "Buyer Personas da Overlens": ("10 - Buyer Personas", "01 Buyer Personas"),
    "": ("10 - Buyer Personas", None),  # empty H1 before Brunin
    "Brunin \\- O Jovem Inconsciente": ("10 - Buyer Personas", "02 Brunin - O Jovem Inconsciente"),
    "Tella \\- A Artista Operante": ("10 - Buyer Personas", "03 Tella - A Artista Operante"),
    "Ander \\- O Produtor Convergente": ("10 - Buyer Personas", "04 Ander - O Produtor Convergente"),
    "Lilly \\- A Consultora Emergente": ("10 - Buyer Personas", "05 Lilly - A Consultora Emergente"),

    # Chapter 11 - Núcleo da Marca
    "Núcleo da marca": ("11 - Núcleo da Marca", "01 Núcleo da marca"),
    "Direção": ("11 - Núcleo da Marca", "02 Direção"),
    "Visão e Propósito": ("11 - Núcleo da Marca", "03 Visão e Propósito"),
    "Storybrand": ("11 - Núcleo da Marca", "04 Storybrand"),
    "Roteiro": ("11 - Núcleo da Marca", "04 Storybrand"),
    "Virtudes / Princípios": ("11 - Núcleo da Marca", "05 Virtudes"),
    "Virtudes": ("11 - Núcleo da Marca", "05 Virtudes"),
    "Arquétipos": ("11 - Núcleo da Marca", "06 Arquétipos"),
    "Proxies": ("11 - Núcleo da Marca", "07 Proxies"),
    "Personas Sintéticas": ("11 - Núcleo da Marca", "08 Personas Sintéticas"),
    "Brand Persona": ("11 - Núcleo da Marca", "08 Personas Sintéticas"),
    "D.U.D": ("11 - Núcleo da Marca", "09 D.U.D"),
    "D.U.D \\- Dispositivo de Ultra Densidade": ("11 - Núcleo da Marca", "09 D.U.D"),
    "T.R.U": ("11 - Núcleo da Marca", "10 T.R.U"),
    "T.R.U \\- Tecnologia de Razão Unificada": ("11 - Núcleo da Marca", "10 T.R.U"),

    # Chapter 12 - Universo Verbal
    "Universo Verbal": ("12 - Universo Verbal", "01 Universo Verbal"),
    "Manifesto": ("12 - Universo Verbal", "02 Manifesto"),
    "Boas-vindas à Era da Criação": ("12 - Universo Verbal", "02 Manifesto"),
    "Tom de Voz": ("12 - Universo Verbal", "03 Tom de Voz"),
    "Tom de Voz da Overlens": ("12 - Universo Verbal", "03 Tom de Voz"),
    "Vocabulário": ("12 - Universo Verbal", "04 Vocabulário"),
    "Território de palavras": ("12 - Universo Verbal", "05 Território de palavras"),
    "Glossário": ("12 - Universo Verbal", "05 Território de palavras"),
    "Diretrizes de uso": ("12 - Universo Verbal", "06 Diretrizes de uso"),
    "Diretrizes de Naming": ("12 - Universo Verbal", "07 Diretrizes de Naming"),

    # Chapter 13 - Arquitetura de Marca
    "Arquitetura de Marca": ("13 - Arquitetura de Marca", "01 Arquitetura de Marca"),
    "Arquitetura de Marca da Overlens": ("13 - Arquitetura de Marca", "01 Arquitetura de Marca"),

    # Chapter 14 - Swipe Files
    "Swipe Files": ("14 - Swipe Files", "01 Swipe Files"),
    "Manifesto: Era da Criação": ("14 - Swipe Files", "02 Manifesto - Era da Criação"),
    "Ensaio Manifesto": ("14 - Swipe Files", "03 Ensaio Manifesto"),
    "Pedido de Ajuda": ("14 - Swipe Files", "04 Pedido de Ajuda"),
    "Pedido de ajuda": ("14 - Swipe Files", "04 Pedido de Ajuda"),
    "Tomorrowland": ("14 - Swipe Files", "05 Tomorrowland"),

    # Chapter 15 - Universo Visual
    "Universo Visual": ("15 - Universo Visual", "01 Universo Visual"),
    "Imagens Arquetípicas": ("15 - Universo Visual", "02 Imagens Arquetípicas"),
    "Moodboard": ("15 - Universo Visual", "03 Moodboard"),
    "Símbolo e logotipo": ("15 - Universo Visual", "04 Símbolo e logotipo"),
    "Guia de Cores": ("15 - Universo Visual", "05 Guia de Cores"),
    "Tipografia": ("15 - Universo Visual", "06 Tipografia"),
    "Iconografia": ("15 - Universo Visual", "07 Iconografia"),
    "Grafismos": ("15 - Universo Visual", "08 Grafismos"),
    "Grid e Layout": ("15 - Universo Visual", "09 Grid e Layout"),
    "Identidade Visual": ("15 - Universo Visual", "10 Identidade Visual"),
    "Diretrizes": ("15 - Universo Visual", "11 Diretrizes"),

    # Chapter 16 - Universo Sonoro
    "Universo Sonoro": ("16 - Universo Sonoro", "01 Universo Sonoro"),
    "Identidade Sonora": ("16 - Universo Sonoro", "02 Identidade Sonora"),

    # Chapter 17 - Estúdio Criativo
    "O Estúdio Criativo": ("17 - Estúdio Criativo", "01 Estúdio Criativo"),
    "Estúdio Criativo da Overlens": ("17 - Estúdio Criativo", "01 Estúdio Criativo"),
    "As duas frentes do Estúdio Criativo": ("17 - Estúdio Criativo", "02 As duas frentes"),
    "Por que centralizamos a criação": ("17 - Estúdio Criativo", "03 Por que centralizamos a criação"),
    "Como realizar solicitações": ("17 - Estúdio Criativo", "04 Como realizar solicitações"),

    # Chapter 18 - Touchpoints
    "Touchpoints": ("18 - Touchpoints", "01 Touchpoints"),
    "Tutorial : Manychat": ("18 - Touchpoints", "02 Tutorial Manychat"),
    "Automação de Post no Manychat": ("18 - Touchpoints", "02 Tutorial Manychat"),
    "Tutorial : Gumroad": ("18 - Touchpoints", "03 Tutorial Gumroad"),
    "Criação de Material no Gumroad": ("18 - Touchpoints", "03 Tutorial Gumroad"),
    "Template para criação de DOCS": ("18 - Touchpoints", "04 Template para DOCS"),
    "Título principal (Título)": ("18 - Touchpoints", "04 Template para DOCS"),
    "Instagram": ("18 - Touchpoints", "05 Instagram"),
    "Pontos de contato": ("18 - Touchpoints", "06 Pontos de contato"),

    # Chapter 19 - Conteúdo
    "Conteúdo": ("19 - Conteúdo", "01 Conteúdo"),
    "Introdução ao conteúdo": ("19 - Conteúdo", "02 Introdução ao conteúdo"),
    "Como pensar no conteúdo": ("19 - Conteúdo", "03 Como pensar no conteúdo"),
    "Como pensar no conteúdo?": ("19 - Conteúdo", "03 Como pensar no conteúdo"),
    "Encontrando Big Ideas": ("19 - Conteúdo", "04 Encontrando Big Ideas"),
    "Encontrando Big Idea": ("19 - Conteúdo", "04 Encontrando Big Ideas"),

    # Chapter 20 - Pacote Cultural
    "Pacote Cultural": ("20 - Pacote Cultural", "01 Pacote Cultural"),
    "Livros sinérgicos": ("20 - Pacote Cultural", "02 Livros sinérgicos"),
    "Filmes e séries sinérgicos": ("20 - Pacote Cultural", "03 Filmes e séries sinérgicos"),
    "Músicas sinérgicas": ("20 - Pacote Cultural", "04 Músicas sinérgicas"),
    "Seu destino está selado em seus olhos.": ("20 - Pacote Cultural", "05 Encerramento"),
}

# Helper: map persona sub-sections (Biografia, Mapa de Empatia) to their persona
persona_context = {
    (548, "Biografia"): ("10 - Buyer Personas", "02 Brunin - O Jovem Inconsciente"),
    (592, "Mapa de Empatia"): ("10 - Buyer Personas", "02 Brunin - O Jovem Inconsciente"),
    (701, "Biografia"): ("10 - Buyer Personas", "03 Tella - A Artista Operante"),
    (742, "Mapa de Empatia"): ("10 - Buyer Personas", "03 Tella - A Artista Operante"),
    (866, "Biografia"): ("10 - Buyer Personas", "04 Ander - O Produtor Convergente"),
    (907, "Mapa de Empatia"): ("10 - Buyer Personas", "04 Ander - O Produtor Convergente"),
    (1010, "Biografia"): ("10 - Buyer Personas", "05 Lilly - A Consultora Emergente"),
    (1051, "Mapa de Empatia"): ("10 - Buyer Personas", "05 Lilly - A Consultora Emergente"),
}

# Build segments: collect lines for each target file
# segments[key] = list of lines
segments = {}
segment_order = []  # to preserve order

for idx, (pos, title) in enumerate(h1_positions):
    # Determine end position
    if idx + 1 < len(h1_positions):
        end_pos = h1_positions[idx + 1][0]
    else:
        end_pos = len(lines)

    content = lines[pos:end_pos]

    # Clean title for lookup
    clean_title = title.replace("\\", "")

    # Handle "Introdução" based on position
    if clean_title == "Introdução" and pos < 10:
        chapter, file_name = "01 - Introdução", "01 Introdução"
        key = (chapter, file_name)
        if key not in segments:
            segments[key] = []
            segment_order.append(key)
        segments[key].extend(content)
        continue
    elif clean_title == "Introdução" and pos > 2700:
        chapter, file_name = "19 - Conteúdo", "02 Introdução ao conteúdo"
        key = (chapter, file_name)
        if key not in segments:
            segments[key] = []
            segment_order.append(key)
        segments[key].extend(content)
        continue

    # Check persona context first (line numbers are 0-indexed)
    if (pos, clean_title) in persona_context:
        chapter, file_name = persona_context[(pos, clean_title)]
    # Handle generic sub-sections within personas by looking at context
    elif clean_title in ("Biografia", "Mapa de Empatia"):
        # Find which persona this belongs to by looking backwards
        current_persona = None
        for prev_idx in range(idx - 1, -1, -1):
            prev_title = h1_positions[prev_idx][1].replace("\\", "")
            if "Brunin" in prev_title:
                current_persona = "02 Brunin - O Jovem Inconsciente"
                break
            elif "Tella" in prev_title:
                current_persona = "03 Tella - A Artista Operante"
                break
            elif "Ander" in prev_title:
                current_persona = "04 Ander - O Produtor Convergente"
                break
            elif "Lilly" in prev_title:
                current_persona = "05 Lilly - A Consultora Emergente"
                break
        if current_persona:
            chapter = "10 - Buyer Personas"
            file_name = current_persona
        else:
            print(f"WARNING: Unmapped persona sub-section at line {pos+1}: '{title}'")
            continue
    elif clean_title in chapter_map:
        chapter, file_name = chapter_map[clean_title]
    elif title in chapter_map:
        chapter, file_name = chapter_map[title]
    else:
        # Try partial match
        found = False
        for key in chapter_map:
            if key and clean_title.startswith(key.replace("\\", "")):
                chapter, file_name = chapter_map[key]
                found = True
                break
        if not found:
            print(f"WARNING: Unmapped H1 at line {pos+1}: '{title}'")
            continue

    if file_name is None:
        continue  # skip empty sections

    key = (chapter, file_name)
    if key not in segments:
        segments[key] = []
        segment_order.append(key)
    segments[key].extend(content)

# Write files
created_files = 0
created_dirs = set()

for key in segment_order:
    chapter, file_name = key
    content = segments[key]

    # Clean content: remove leading/trailing blank lines
    while content and content[0].strip() == "":
        content.pop(0)
    while content and content[-1].strip() == "":
        content.pop()

    # Create directory
    dir_path = os.path.join(OUTPUT_DIR, chapter)
    if dir_path not in created_dirs:
        os.makedirs(dir_path, exist_ok=True)
        created_dirs.add(dir_path)

    # Write file
    file_path = os.path.join(dir_path, f"{file_name}.md")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write("".join(content))

    created_files += 1
    print(f"  OK {chapter}/{file_name}.md")

print(f"\nDone! Created {created_files} files in {len(created_dirs)} folders.")
