$Repo = "m0st4f4-hub/MCP-ProjectManager"
$BaseBranch = "main"

while ($true) {
    Write-Host "🔍 Fetching open PRs from $Repo ..."
    $prsJson = gh pr list --state open --limit 300 --repo $Repo --json number,headRefName
    $prs = $prsJson | ConvertFrom-Json

    if (-not $prs) {
        Write-Host "✅ No more open PRs. Exiting."
        break
    }

    $mergedAny = $false

    foreach ($pr in $prs) {
        $prNumber = $pr.number
        $branchName = $pr.headRefName

        Write-Host "➡️ Attempting squash merge for PR #$prNumber ($branchName)..."

        try {
            # Ensure on main and up to date
            git checkout $BaseBranch 2>&1 | Out-Null
            git pull origin $BaseBranch 2>&1 | Out-Null

            # Attempt squash merge
            gh pr merge $prNumber `
                --repo $Repo `
                --squash `
                --delete-branch `
                --admin `
                --body "🤖 Squash merged automatically by PowerShell agent" 2>&1 | Out-Null

            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Successfully merged PR #$prNumber"
                $mergedAny = $true
            } else {
                Write-Host "⚠️ Could not merge PR #$prNumber (likely conflict). Skipping... Last Exit Code: ${LASTEXITCODE}"
            }
        } catch {
            # Removed problematic error message printing to avoid parsing errors
            # Write-Host "❌ Error merging PR #$prNumber: $($_.Exception.Message) . Last Exit Code: ${LASTEXITCODE}"
        }
    }

    if (-not $mergedAny) {
        Write-Host "⛔ No PRs were merged this round. Possibly all are blocked. Exiting."
        break
    }

    Write-Host "🔁 Looping again for any remaining PRs..."
}