<#
Run tests helper for Windows PowerShell.
Installs pytest if missing then runs pytest from repo root.
#>
try {
    python -m pip show pytest > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "pytest not found — installing requirements.txt (may take a while)"
        python -m pip install -r "$(Resolve-Path ..\requirements.txt)";
    } else {
        # Ensure pytest-sugar and pytest-cov installed for nice output and coverage
        python -m pip show pytest-sugar > $null 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Installing pytest-sugar and pytest-cov"
            python -m pip install pytest-sugar pytest-cov
        }
    }
} catch {
    Write-Host "Error checking/installing pytest: $_"; exit 1
}

Write-Host "Running pytest (with pytest-sugar if available)..."
python -m pytest -q

if ($LASTEXITCODE -ne 0) {
    Write-Host "Tests failed. See output above."; exit $LASTEXITCODE
} else {
    Write-Host "All tests passed."; exit 0
}
