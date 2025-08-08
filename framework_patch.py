import os
import re
import logging
import shutil

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def patch(filepath):
    with open(filepath, 'r') as file:
        lines = file.readlines()

    if not any('invoke-custom' in line for line in lines):
        return
    modified_lines = []
    in_method = False
    method_type = None
    method_patterns = {
        "equals": re.compile(r'\.method.*equals\(Ljava/lang/Object;\)Z'),
        "hashCode": re.compile(r'\.method.*hashCode\(\)I'),
        "toString": re.compile(r'\.method.*toString\(\)Ljava/lang/String;')
    }
    registers_line = ""

    for line in lines:
        if in_method:
            if line.strip().startswith('.registers'):
                registers_line = line
                continue

            if line.strip() == '.end method':
                if method_type in method_patterns:
                    logging.info(f"{method_type} fonksiyonunun gövdesi temizleniyor")
                    modified_lines.append(registers_line)
                    if method_type == "hashCode":
                        modified_lines.append("    const/4 v0, 0x0\n")
                        modified_lines.append("    return v0\n")
                    elif method_type == "equals":
                        modified_lines.append("    const/4 v0, 0x0\n")
                        modified_lines.append("    return v0\n")
                    elif method_type == "toString":
                        modified_lines.append("    const/4 v0, 0x0\n")
                        modified_lines.append("    return-object v0\n")
                in_method = False
                method_type = None
                registers_line = ""
            else:
                continue

        for key, pattern in method_patterns.items():
            if pattern.search(line):
                logging.info(f"{key} metodu bulundu. İçerik temizleniyor.")
                in_method = True
                method_type = key
                modified_lines.append(line)  # metod tanımı eklendi
                break

        if not in_method:
            modified_lines.append(line)

    with open(filepath, 'w') as file:
        file.writelines(modified_lines)
    logging.info(f"Dosya için değişiklikler tamamlandı: {filepath}")

def modify_file(file_path):
    logging.info(f"Dosya değiştiriliyor: {file_path}")
    with open(file_path, 'r') as file:
        lines = file.readlines()

    modified_lines = []
    in_method = False
    method_type = None
    method_start_line = ""
    original_registers_line = ""

    method_patterns = {
        "checkCapability": re.compile(r'\.method.*checkCapability\(.*\)Z'),
        "checkCapabilityRecover": re.compile(r'\.method.*checkCapabilityRecover\(.*\)Z'),
        "hasAncestorOrSelf": re.compile(r'\.method.*hasAncestorOrSelf\(.*\)Z'),
        "verifyMessageDigest" : re.compile(r'\.method.*verifyMessageDigest\(.*\)Z'),
        "getMinimumSignatureSchemeVersionForTargetSdk": re.compile(
            r'\.method.*getMinimumSignatureSchemeVersionForTargetSdk\(I\)I'),
        "isPackageWhitelistedForHiddenApis": re.compile(r'\.method.*isPackageWhitelistedForHiddenApis\(.*\)Z'),
    }

    for line in lines:
        if in_method:
            if line.strip().startswith('.registers'):
                original_registers_line = line
                continue

            if line.strip() == '.end method':
                modified_lines.append(method_start_line)
                if method_type == "checkCapability":
                    logging.info(f"{method_type} fonksiyon gövdesi değiştiriliyor")
                    modified_lines.append(original_registers_line)
                    modified_lines.append("    const/4 v0, 0x1\n")
                    modified_lines.append("    return v0\n")
                elif method_type == "checkCapabilityRecover":
                    logging.info(f"{method_type} fonksiyon gövdesi değiştiriliyor")
                    modified_lines.append(original_registers_line)
                    modified_lines.append("    .annotation system Ldalvik/annotation/Throws;\n")
                    modified_lines.append("        value = {\n")
                    modified_lines.append("            Ljava/security/cert/CertificateException;\n")
                    modified_lines.append("        }\n")
                    modified_lines.append("    .end annotation\n")
                    modified_lines.append("    const/4 v0, 0x1\n")
                    modified_lines.append("    return v0\n")
                elif method_type == "hasAncestorOrSelf":
                    logging.info(f"{method_type} fonksiyon gövdesi değiştiriliyor")
                    modified_lines.append(original_registers_line)
                    modified_lines.append("    const/4 v0, 0x1\n")
                    modified_lines.append("    return v0\n")
                elif method_type == "verifyMessageDigest":
                    logging.info(f"{method_type} fonksiyon gövdesi değiştiriliyor")
                    modified_lines.append(original_registers_line)
                    modified_lines.append("    const/4 v0, 0x1\n")
                    modified_lines.append("    return v0\n")
                elif method_type == "getMinimumSignatureSchemeVersionForTargetSdk":
                    logging.info(f"{method_type} fonksiyon gövdesi değiştiriliyor")
                    modified_lines.append(original_registers_line)
                    modified_lines.append("    const/4 v0, 0x0\n")
                    modified_lines.append("    return v0\n")
                elif method_type == "isPackageWhitelistedForHiddenApis":
                    modified_lines.append(original_registers_line)
                    modified_lines.append("    const/4 v0, 0x1\n")
                    modified_lines.append("    return v0\n")
                in_method = False
                method_type = None
                original_registers_line = ""
            else:
                continue

        for key, pattern in method_patterns.items():
            if pattern.search(line):
                in_method = True
                method_type = key
                method_start_line = line
                break

        if not in_method:
            modified_lines.append(line)

    with open(file_path, 'w') as file:
        file.writelines(modified_lines)
    logging.info(f"Dosya için değişiklikler tamamlandı: {file_path}")

def modify_package_parser(file_path):
    logging.info(f"PackageParser dosyası değiştiriliyor: {file_path}")
    with open(file_path, 'r') as file:
        lines = file.readlines()

    modified_lines = []
    pattern = re.compile(
        r'invoke-static \{v2, v0, v1\}, Landroid/util/apk/ApkSignatureVerifier;->unsafeGetCertsWithoutVerification\(Landroid/content/pm/parsing/result/ParseInput;Ljava/lang/String;I\)Landroid/content/.*'
    )

    for line in lines:
        if pattern.search(line):
            logging.info(f"Hedef satır bulundu. Üstüne satır ekleniyor.")
            modified_lines.append("    const/4 v1, 0x1\n")
        modified_lines.append(line)

    with open(file_path, 'w') as file:
        file.writelines(modified_lines)
    logging.info(f"PackageParser dosyası değişikliği tamamlandı: {file_path}")

def modify_apk_signature_verifier(file_path):
    logging.info(f"ApkSignatureVerifier dosyası değiştiriliyor: {file_path}")
    with open(file_path, 'r') as file:
        lines = file.readlines()

    modified_lines = []
    pattern = re.compile(
        r'invoke-static \{p0, p1, p3\}, Landroid/util/apk/ApkSignatureVerifier;->verifyV1Signature\(Landroid/content/pm/parsing/result/ParseInput;Ljava/lang/String;Z\)Landroid/content/pm/parsing/result/.*'
    )

    for line in lines:
        if pattern.search(line):
            logging.info(f"Hedef satır bulundu. Üstüne satır ekleniyor.")
            modified_lines.append("    const p3, 0x0\n")
        modified_lines.append(line)

    with open(file_path, 'w') as file:
        file.writelines(modified_lines)
    logging.info(f"ApkSignatureVerifier dosyası değişikliği tamamlandı: {file_path}")

def modify_exception_file(file_path):
    logging.info(f"Exception dosyası değiştiriliyor: {file_path}")
    with open(file_path, 'r') as file:
        lines = file.readlines()

    modified_lines = []
    for line in lines:
        if re.search(r'iput p1, p0, Landroid/content/pm/PackageParser\$PackageParserException;->error:I', line):
            logging.info(f"'iput' satırının üstüne satır ekleniyor: {file_path}")
            modified_lines.append("    const/4 p1, 0x0\n")
        modified_lines.append(line)

    with open(file_path, 'w') as file:
        file.writelines(modified_lines)
    logging.info(f"Exception dosyası değişikliği tamamlandı: {file_path}")

def modify_apk_signature_scheme_v2_verifier(file_path):
    logging.info(f"ApkSignatureSchemeV2Verifier dosyası değiştiriliyor: {file_path}")
    modify_invoke_static(file_path)

def modify_apk_signature_scheme_v3_verifier(file_path):
    logging.info(f"ApkSignatureSchemeV3Verifier dosyası değiştiriliyor: {file_path}")
    modify_invoke_static(file_path)

def modify_apk_signing_block_utils(file_path):
    logging.info(f"ApkSigningBlockUtils dosyası değiştiriliyor: {file_path}")
    modify_invoke_static(file_path)

def modify_invoke_static(file_path):
    with open(file_path, 'r') as file:
        lines = file.readlines()

    modified_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        modified_lines.append(line)
        if 'Ljava/security/MessageDigest;->isEqual([B[B)Z' in line:
            for j in range(i + 1, min(i + 4, len(lines))):
                if re.match(r'\s*move-result\s+(v\d+)', lines[j]):
                    variable = re.search(r'\s*move-result\s+(v\d+)', lines[j]).group(1)
                    logging.info(f"Satır değiştiriliyor: {lines[j].strip()} -> const/4 {variable}, 0x1")
                    modified_lines[-1] = line
                    modified_lines.append(f"    const/4 {variable}, 0x1\n")
                    i = j
                    break
        i += 1

    with open(file_path, 'w') as file:
        file.writelines(modified_lines)
    logging.info(f"invoke-static değişikliği tamamlandı: {file_path}")

def modify_strict_jar_verifier(file_path):
    logging.info(f"StrictJarVerifier dosyası değiştiriliyor: {file_path}")
    modify_invoke_static(file_path)
    with open(file_path, 'r') as file:
        lines = file.readlines()

    modified_lines = []
    in_method = False
    method_start_pattern = re.compile(r'\.method private static blacklist verifyMessageDigest\(\[B\[B\)Z')
    target_line_pattern = re.compile(r'const/4 v1, 0x0')

    for line in lines:
        if in_method:
            if line.strip() == '.end method':
                in_method = False

        if method_start_pattern.search(line):
            in_method = True

        if in_method and target_line_pattern.search(line):
            logging.info(f"Hedef satır bulundu. Değiştiriliyor.")
            line = line.replace('const/4 v1, 0x0', 'const/4 v1, 0x1')

        modified_lines.append(line)

    with open(file_path, 'w') as file:
        file.writelines(modified_lines)
    logging.info(f"StrictJarVerifier dosyası değişikliği tamamlandı: {file_path}")

def modify_Parsing_Package_Utils_sharedUserId(file_path):
    logging.info(f"parseSharedUser fonksiyonu değiştiriliyor: {file_path}")
    with open(file_path, 'r') as file:
        lines = file.readlines()

    modified_lines = []
    in_method = False
    const_string_index = None
    target_register = None
    last_if_eqz_index = None

    for i, line in enumerate(lines):
        if re.match(r'\.method.*parseSharedUser\(.*\)', line) and "private" in line:
            logging.info("parseSharedUser fonksiyonu bulundu.")
            in_method = True

        if in_method:
            if re.search(r'const-string.*<manifest>.*sharedUserId', line):
                logging.info(f"Hata mesajı içeren const-string bulundu (satır {i + 1}): {line.strip()}")
                const_string_index = i
                break

            if "if-eqz" in line:
                last_if_eqz_index = i
                match = re.search(r'if-eqz (\w+),', line)
                if match:
                    target_register = match.group(1)

    if last_if_eqz_index is not None and const_string_index is not None and last_if_eqz_index < const_string_index:
        logging.info(f"'if-eqz' değiştiriliyor (satır {last_if_eqz_index + 1}): {lines[last_if_eqz_index].strip()}")
        modified_lines = (
            lines[:last_if_eqz_index]
            + [f"    const/4 {target_register}, 0x0\n"]
            + lines[last_if_eqz_index:]
        )
    else:
        logging.warning("const-string'den önce geçerli bir 'if-eqz' bulunamadı.")
        modified_lines = lines

    with open(file_path, 'w') as file:
        file.writelines(modified_lines)
    logging.info(f"parseSharedUser fonksiyonu değişikliği tamamlandı: {file_path}")

def modify_android_content_pm_PackageParser(file_path):
    logging.info(f"android.content.pm.PackageParser değiştiriliyor: {file_path}")
    with open(file_path, 'r') as file:
        lines = file.readlines()

    modified_lines = []
    target_string = "\"<manifest> specifies bad sharedUserId name \\\"\""
    if_nez_pattern = re.compile(r'if-nez v14, :cond_\w+')
    
    for i, line in enumerate(lines):
        if target_string in line:
            logging.info(f"Hedef string bulundu (satır {i + 1}): {line.strip()}")
            for j in range(i - 1, -1, -1):
                if if_nez_pattern.search(lines[j]):
                    logging.info(f"'if-nez' bulundu (satır {j + 1}): {lines[j].strip()}")
                    modified_lines = (
                        lines[:j] +
                        ["    const/4 v14, 0x1\n"] +
                        lines[j:]
                    )
                    break
            else:
                logging.warning("Hedef string'den önce 'if-nez' bulunamadı.")
                modified_lines = lines
            break
    else:
        logging.warning("Hedef string bulunamadı.")
        modified_lines = lines

    with open(file_path, 'w') as file:
        file.writelines(modified_lines)
    logging.info(f"android.content.pm.PackageParser değişikliği tamamlandı: {file_path}")

def modify_strict_jar_file(file_path):
    logging.info(f"Dosya işleniyor: {file_path}")

    with open(file_path, 'r') as file:
        lines = file.readlines()

    modified_lines = []
    i = 0

    invoke_virtual_pattern = re.compile(
        r'invoke-virtual \{p0, v5\}, Landroid/util/jar/StrictJarFile;->findEntry\(Ljava/lang/String;\)Ljava/util/zip/ZipEntry;')
    if_eqz_pattern = re.compile(r'if-eqz v\d+, :cond_\w+')
    label_pattern = re.compile(r':cond_\w+')

    while i < len(lines):
        line = lines[i]

        if invoke_virtual_pattern.search(line):
            modified_lines.append(line)
            i += 1

            while i < len(lines):
                next_line = lines[i]

                if if_eqz_pattern.search(next_line):
                    logging.info(f"Satır siliniyor: {next_line.strip()}")
                    i += 1

                    while i < len(lines):
                        next_line = lines[i]
                        if label_pattern.search(next_line):
                            logging.info(f"Satır siliniyor: {next_line.strip()}")
                            i += 1
                            break
                        else:
                            modified_lines.append(next_line)
                        i += 1
                    break

                modified_lines.append(next_line)
                i += 1

        else:
            modified_lines.append(line)
            i += 1

    with open(file_path, 'w') as file:
        file.writelines(modified_lines)

    logging.info(f"Dosya değişikliği tamamlandı: {file_path}")

def copy_and_replace_files(source_dirs, target_dirs, sub_dirs):
    for source_dir, sub_dir in zip(source_dirs, sub_dirs):
        for target_dir in target_dirs:
            target_policy_dir = os.path.join(target_dir, sub_dir)
            if os.path.exists(target_policy_dir):
                logging.info(f"{source_dir} içindeki dosyalar {target_policy_dir} klasörüne kopyalanıyor")
                for root, dirs, files in os.walk(source_dir):
                    for file in files:
                        src_file = os.path.join(root, file)
                        dst_file = os.path.join(target_policy_dir, os.path.relpath(src_file, source_dir))
                        dst_dir = os.path.dirname(dst_file)
                        if not os.path.exists(dst_dir):
                            os.makedirs(dst_dir)
                        shutil.copy2(src_file, dst_file)
                        logging.info(f"{src_file} -> {dst_file} kopyalandı")
            else:
                logging.warning(f"Hedef klasör mevcut değil: {target_policy_dir}")

def modify_smali_files(directories):
    for directory in directories:
        logging.info(f"'{directory}' klasörü taranıyor")
        for root, _, files in os.walk(directory):
            for file in files:
                if file.endswith(".smali"):
                    filepath = os.path.join(root, file)
                    patch(filepath)
        signing_details = os.path.join(directory, 'android/content/pm/SigningDetails.smali')
        package_parser_signing_details = os.path.join(directory,
                                                      'android/content/pm/PackageParser$SigningDetails.smali')
        apk_signature_verifier = os.path.join(directory, 'android/util/apk/ApkSignatureVerifier.smali')
        apk_signature_scheme_v2_verifier = os.path.join(directory,
                                                        'android/util/apk/ApkSignatureSchemeV2Verifier.smali')
        apk_signature_scheme_v3_verifier = os.path.join(directory,
                                                        'android/util/apk/ApkSignatureSchemeV3Verifier.smali')
        apk_signing_block_utils = os.path.join(directory, 'android/util/apk/ApkSigningBlockUtils.smali')
        package_parser = os.path.join(directory, 'android/content/pm/PackageParser.smali')
        package_parser_exception = os.path.join(directory,
                                                'android/content/pm/PackageParser$PackageParserException.smali')
        strict_jar_verifier = os.path.join(directory, 'android/util/jar/StrictJarVerifier.smali')
        Parsing_Package_Utils_sharedUserId = os.path.join(directory, 'com/android/internal/pm/pkg/parsing/ParsingPackageUtils.smali')
        strict_jar_file = os.path.join(directory, 'android/util/jar/StrictJarFile.smali')
        android_content_pm_PackageParser = os.path.join(directory, 'android/content/pm/PackageParser.smali')
        application_info = os.path.join(directory, 'android/content/pm/ApplicationInfo.smali')

        if os.path.exists(signing_details):
            logging.info(f"Dosya bulundu: {signing_details}")
            modify_file(signing_details)
        else:
            logging.warning(f"Dosya bulunamadı: {signing_details}")
        if os.path.exists(package_parser_signing_details):
            logging.info(f"Dosya bulundu: {package_parser_signing_details}")
            modify_file(package_parser_signing_details)
        else:
            logging.warning(f"Dosya bulunamadı: {package_parser_signing_details}")
        if os.path.exists(apk_signature_verifier):
            logging.info(f"Dosya bulundu: {apk_signature_verifier}")
            modify_apk_signature_verifier(apk_signature_verifier)
            modify_file(apk_signature_verifier)
        else:
            logging.warning(f"Dosya bulunamadı: {apk_signature_verifier}")

        if os.path.exists(apk_signature_scheme_v2_verifier):
            logging.info(f"Dosya bulundu: {apk_signature_scheme_v2_verifier}")
            modify_apk_signature_scheme_v2_verifier(apk_signature_scheme_v2_verifier)
        else:
            logging.warning(f"Dosya bulunamadı: {apk_signature_scheme_v2_verifier}")
        if os.path.exists(apk_signature_scheme_v3_verifier):
            logging.info(f"Dosya bulundu: {apk_signature_scheme_v3_verifier}")
            modify_apk_signature_scheme_v3_verifier(apk_signature_scheme_v3_verifier)
        else:
            logging.warning(f"Dosya bulunamadı: {apk_signature_scheme_v3_verifier}")
        if os.path.exists(apk_signing_block_utils):
            logging.info(f"Dosya bulundu: {apk_signing_block_utils}")
            modify_apk_signing_block_utils(apk_signing_block_utils)
        else:
            logging.warning(f"Dosya bulunamadı: {apk_signing_block_utils}")
        if os.path.exists(package_parser):
            logging.info(f"Dosya bulundu: {package_parser}")
            modify_package_parser(package_parser)
        else:
            logging.warning(f"Dosya bulunamadı: {package_parser}")
        if os.path.exists(package_parser_exception):
            logging.info(f"Dosya bulundu: {package_parser_exception}")
            modify_exception_file(package_parser_exception)
        else:
            logging.warning(f"Dosya bulunamadı: {package_parser_exception}")
        if os.path.exists(strict_jar_verifier):
            logging.info(f"Dosya bulundu: {strict_jar_verifier}")
            modify_strict_jar_verifier(strict_jar_verifier)
        else:
            logging.warning(f"Dosya bulunamadı: {strict_jar_verifier}")
        if os.path.exists(Parsing_Package_Utils_sharedUserId):
            logging.info(f"Dosya bulundu: {Parsing_Package_Utils_sharedUserId}")
            modify_Parsing_Package_Utils_sharedUserId(Parsing_Package_Utils_sharedUserId)
        else:
            logging.warning(f"Dosya bulunamadı: {Parsing_Package_Utils_sharedUserId}")
        if os.path.exists(strict_jar_file):
            logging.info(f"Dosya bulundu: {strict_jar_file}")
            modify_strict_jar_file(strict_jar_file)
        else:
            logging.warning(f"Dosya bulunamadı: {strict_jar_file}")
        if os.path.exists(android_content_pm_PackageParser):
            logging.info(f"Dosya bulundu: {android_content_pm_PackageParser}")
            modify_android_content_pm_PackageParser(android_content_pm_PackageParser)
        else:
            logging.warning(f"Dosya bulunamadı: {android_content_pm_PackageParser}")
        if os.path.exists(application_info):
            logging.info(f"Dosya bulundu: {application_info}")
            # modify_application_info(application_info)  # Bu satırı kaldırabilir veya yorum satırı yapabilirsiniz
        else:
            logging.warning(f"Dosya bulunamadı: {application_info}")

if __name__ == "__main__":
    directories = ["classes", "classes2", "classes3", "classes4", "classes5"]
    modify_smali_files(directories)
