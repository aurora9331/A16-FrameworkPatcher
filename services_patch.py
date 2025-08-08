import os
import re
import shutil
import logging

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
                    logging.info(f"{method_type} metodu gövdesi temizleniyor")
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
                logging.info(f"{key} metodu bulundu. Metot içeriği temizleniyor.")
                in_method = True
                method_type = key
                modified_lines.append(line)  # Metot deklarasyonunu ekle
                break

        if not in_method:
            modified_lines.append(line)

    with open(filepath, 'w') as file:
        file.writelines(modified_lines)
    logging.info(f"Dosya için düzenleme tamamlandı: {filepath}")
    
def modify_file(file_path):
    logging.info(f"Dosya düzenleniyor: {file_path}")
    with open(file_path, 'r') as file:
        lines = file.readlines()

    modified_lines = []
    in_method = False
    method_type = None
    method_start_line = ""

    method_patterns = {
        "checkDowngrade": re.compile(
            r'\.method\s+public\s+static\s+checkDowngrade\(Lcom/android/server/pm/pkg/AndroidPackage;Landroid/content/pm/PackageInfoLite;\)V'),
        "shouldCheckUpgradeKeySetLocked": re.compile(
            r'\.method\s+public\s+shouldCheckUpgradeKeySetLocked\(Lcom/android/server/pm/pkg/PackageStateInternal;Lcom/android/server/pm/pkg/SharedUserApi;I\)Z'),
        "verifySignatures": re.compile(
            r'\.method\s+public\s+static\s+verifySignatures\(Lcom/android/server/pm/PackageSetting;Lcom/android/server/pm/SharedUserSetting;Lcom/android/server/pm/PackageSetting;Landroid/content/pm/SigningDetails;\)I'),
        "compareSignatures": re.compile(
            r'\.method\s+public\s+static\s+compareSignatures\(Landroid/content/pm/SigningDetails;Landroid/content/pm/SigningDetails;\)I'),
        "matchSignaturesCompat": re.compile(
            r'\.method.*matchSignaturesCompat\(.*\)Z')
    }

    for line in lines:
        if in_method:
            if line.strip() == '.end method':
                modified_lines.append(method_start_line)
                if method_type == "checkDowngrade":
                    logging.info(f"{method_type} metodu gövdesi düzenleniyor")
                    modified_lines.append("    .registers 2\n")
                    modified_lines.append("    .annotation system Ldalvik/annotation/Throws;\n")
                    modified_lines.append("        value = {\n")
                    modified_lines.append("            Lcom/android/server/pm/PackageManagerException;\n")
                    modified_lines.append("        }\n")
                    modified_lines.append("    .end annotation\n")
                    modified_lines.append("    return-void\n")
                elif method_type == "shouldCheckUpgradeKeySetLocked":
                    logging.info(f"{method_type} metodu gövdesi düzenleniyor")
                    original_registers_line = "    .registers 10\n"
                    modified_lines.append(original_registers_line)
                    modified_lines.append("    const/4 v0, 0x0\n")
                    modified_lines.append("    return v0\n")
                elif method_type == "verifySignatures":
                    logging.info(f"{method_type} metodu gövdesi düzenleniyor")
                    modified_lines.append("    .registers 21\n")
                    modified_lines.append("    .annotation system Ldalvik/annotation/Throws;\n")
                    modified_lines.append("        value = {\n")
                    modified_lines.append("            Lcom/android/server/pm/PackageManagerException;\n")
                    modified_lines.append("        }\n")
                    modified_lines.append("    .end annotation\n")
                    modified_lines.append("    const/4 v1, 0x0\n")
                    modified_lines.append("    return v1\n")
                elif method_type == "compareSignatures":
                    logging.info(f"{method_type} metodu gövdesi düzenleniyor")
                    modified_lines.append("    .registers 3\n")
                    modified_lines.append("    const/4 v0, 0x0\n")
                    modified_lines.append("    return v0\n")
                elif method_type == "matchSignaturesCompat":
                    logging.info(f"{method_type} metodu gövdesi düzenleniyor")
                    modified_lines.append("    .registers 5\n")
                    modified_lines.append("    const/4 v0, 0x1\n")
                    modified_lines.append("    return v0\n")
                in_method = False
                method_type = None
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
    logging.info(f"Dosya düzenlemesi tamamlandı: {file_path}")
    
def modify_reconcile_package_utils(file_path):
    """
    Smali dosyasını düzenleyerek, belirtilen invoke-static satırından sonra ilk `const/4 v0, 0x0` satırını
    `const/4 v0, 0x1` olarak değiştir.
    """
    target_line = "invoke-static {}, Lcom/android/internal/hidden_from_bootclasspath/android/content/pm/Flags;->restrictNonpreloadsSystemShareduids()Z"
    found_target = False
    modified = False

    with open(file_path, 'r') as file:
        lines = file.readlines()

    modified_lines = []
    for line in lines:
        modified_lines.append(line)
        if target_line in line:
            logging.info(f"Hedef satır bulundu: {line.strip()}")
            found_target = True
            continue
        
        if found_target and "const/4 v0, 0x0" in line and not modified:
            # İlk `const/4 v0, 0x0` satırını `const/4 v0, 0x1` olarak değiştir
            logging.info(f"Satır düzenleniyor: {line.strip()}")
            modified_lines[-1] = "    const/4 v0, 0x1\n"
            modified = True

    if not found_target:
        logging.warning(f"Hedef satır dosyada bulunamadı: {file_path}")
    elif not modified:
        logging.warning(f"Hedef satırdan sonra `const/4 v0, 0x0` bulunamadı: {file_path}")

    with open(file_path, 'w') as file:
        file.writelines(modified_lines)

    if modified:
        logging.info(f"Dosya başarıyla düzenlendi: {file_path}")


def modify_install_package_helper(file_path):
    logging.info(f"{file_path} içinde preparePackageLI düzenleniyor")
    with open(file_path, 'r') as file:
        lines = file.readlines()

    modified_lines = []
    in_method = False
    const_string_index = None
    target_register = None
    last_if_eqz_index = None

    for i, line in enumerate(lines):
        if re.match(r'\.method.*preparePackageLI\(.*\)', line) and "private" in line:
            logging.info("Metot bulundu: preparePackageLI.")
            in_method = True

        if in_method:
            if re.search(r'invoke-interface \{p5\}, Lcom/android/server/pm/pkg/AndroidPackage;->isLeavingSharedUser\(\)Z', line):
                logging.info(f"invoke-interface satırı bulundu satır {i + 1}: {line.strip()}")
                const_string_index = i
                break

            if "if-eqz" in line:
                last_if_eqz_index = i
                match = re.search(r'if-eqz (\w+),', line)
                if match:
                    target_register = match.group(1)

    if last_if_eqz_index is not None and const_string_index is not None and last_if_eqz_index < const_string_index:
        logging.info(f"'if-eqz' satırı düzenleniyor satır {last_if_eqz_index + 1}: {lines[last_if_eqz_index].strip()}")
        modified_lines = (
            lines[:last_if_eqz_index]
            + [f"    const/4 {target_register}, 0x1\n"]
            + lines[last_if_eqz_index:]
        )
    else:
        logging.warning("const-string öncesinde geçerli bir 'if-eqz' bulunamadı.")
        modified_lines = lines

    with open(file_path, 'w') as file:
        file.writelines(modified_lines)
    logging.info(f"{file_path} içinde preparePackageLI düzenlemesi tamamlandı")

def modify_smali_files(directories):
    for directory in directories:
        logging.info(f"Dizin taranıyor: {directory}")
        for root, _, files in os.walk(directory):
            for file in files:
                if file.endswith(".smali"):
                    filepath = os.path.join(root, file)
                    patch(filepath)
        package_manager_service_utils = os.path.join(directory,
                                                     'com/android/server/pm/PackageManagerServiceUtils.smali')
        install_package_helper = os.path.join(directory, 'com/android/server/pm/InstallPackageHelper.smali')
        Key_Set_Manager_Service = os.path.join(directory, 'com/android/server/pm/KeySetManagerService.smali')
        reconcile_package_utils = os.path.join(directory, 'com/android/server/pm/ReconcilePackageUtils.smali')
        verify_Signatures = os.path.join(directory, 'com/android/server/pm/PackageManagerServiceUtils.smali')

        if os.path.exists(package_manager_service_utils):
            logging.info(f"Dosya bulundu: {package_manager_service_utils}")
            modify_file(package_manager_service_utils)
        else:
            logging.warning(f"Dosya bulunamadı: {package_manager_service_utils}")

        if os.path.exists(Key_Set_Manager_Service):
            logging.info(f"Dosya bulundu: {Key_Set_Manager_Service}")
            modify_file(Key_Set_Manager_Service)
        else:
            logging.warning(f"Dosya bulunamadı: {Key_Set_Manager_Service}")

        if os.path.exists(verify_Signatures):
            logging.info(f"Dosya bulundu: {verify_Signatures}")
            modify_file(verify_Signatures)
        else:
            logging.warning(f"Dosya bulunamadı: {verify_Signatures}")

        if os.path.exists(install_package_helper):
            logging.info(f"Dosya bulundu: {install_package_helper}")
            modify_install_package_helper(install_package_helper)
        else:
            logging.warning(f"Dosya bulunamadı: {install_package_helper}")

        if os.path.exists(reconcile_package_utils):
            logging.info(f"Dosya bulundu: {reconcile_package_utils}")
            modify_reconcile_package_utils(reconcile_package_utils)
        else:
            logging.warning(f"Dosya bulunamadı: {reconcile_package_utils}")


if __name__ == "__main__":
    directories = ["services_classes", "services_classes2", "services_classes3", "services_classes4", "services_classes5"]
    modify_smali_files(directories)
